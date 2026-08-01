import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { apiConfig } from './config';
import { createLimiter } from './concurrency';

export type ManagerMode = 'boot' | 'auth' | 'passthrough';

const DISPATCH_DEFER = Symbol('dispatch-defer');

type QueueItem = {
  config: InternalAxiosRequestConfig;
  resolve: (response: AxiosResponse) => void;
  reject: (reason: unknown) => void;
  inFlight: boolean;
  /** Got 401; waiting for refresh replay */
  held: boolean;
  /** Already retried once after a successful refresh wave */
  afterRefresh: boolean;
};

const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

/** Raw transport — bypasses the manager queue (boot, refresh, internal). */
export const transport = axios.create({
  baseURL: apiConfig.baseURL,
  withCredentials: true,
  adapter: defaultAdapter,
});

const limitGet = createLimiter(apiConfig.concurrency);

let mode: ManagerMode = 'boot';
let refreshHold = false;
let refreshPromise: Promise<void> | null = null;
let forceLogoutStarted = false;
let initPromise: Promise<void> | null = null;

const queue: QueueItem[] = [];

let broadcast: BroadcastChannel | null = null;

function getBroadcast(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!broadcast) {
    broadcast = new BroadcastChannel(apiConfig.refreshChannelName);
    broadcast.addEventListener('message', (event: MessageEvent) => {
      const type = (event.data as { type?: string } | null)?.type;
      if (type === 'refresh-fail') {
        forceLogout(new Error('Session refresh failed in another tab'));
      }
    });
  }
  return broadcast;
}

function isBlacklisted(config: AxiosRequestConfig): boolean {
  const url = config.url ?? '';
  return apiConfig.authBlacklist.some(
    (path) => url === path || url.startsWith(`${path}?`) || url.endsWith(path),
  );
}

function isGet(config: AxiosRequestConfig): boolean {
  const method = (config.method ?? 'get').toLowerCase();
  return method === 'get';
}

function isFreshMarker(): boolean {
  try {
    const raw = localStorage.getItem(apiConfig.refreshMarkerKey);
    if (!raw) {
      return false;
    }
    const at = Number(raw);
    if (!Number.isFinite(at)) {
      return false;
    }
    return Date.now() - at < apiConfig.refreshMarkerTtlMs;
  } catch {
    return false;
  }
}

function setRefreshMarker(): void {
  try {
    localStorage.setItem(apiConfig.refreshMarkerKey, String(Date.now()));
  } catch {
    // ignore quota / private mode
  }
}

function canDispatch(): boolean {
  return mode !== 'boot' && !refreshHold;
}

function removeItem(item: QueueItem): void {
  const index = queue.indexOf(item);
  if (index >= 0) {
    queue.splice(index, 1);
  }
}

function rejectAllRemaining(reason: unknown): void {
  const items = [...queue];
  queue.length = 0;
  for (const item of items) {
    item.reject(reason);
  }
}

function forceLogout(reason: unknown): void {
  if (forceLogoutStarted) {
    return;
  }
  forceLogoutStarted = true;
  rejectAllRemaining(reason);
  try {
    getBroadcast()?.postMessage({ type: 'refresh-fail' });
  } catch {
    // ignore
  }
  window.location.reload();
}

async function coordinatedRefresh(): Promise<void> {
  const channel = getBroadcast();
  let channelHandler: ((event: MessageEvent) => void) | null = null;

  const fromChannel =
    channel === null
      ? null
      : new Promise<void>((resolve, reject) => {
          channelHandler = (event: MessageEvent) => {
            const type = (event.data as { type?: string } | null)?.type;
            if (type === 'refresh-ok') {
              resolve();
            } else if (type === 'refresh-fail') {
              reject(new Error('Session refresh failed'));
            }
          };
          channel.addEventListener('message', channelHandler);
        });

  const runRefresh = async (): Promise<void> => {
    if (isFreshMarker()) {
      channel?.postMessage({ type: 'refresh-ok' });
      return;
    }
    try {
      await transport.post('/auth/refresh');
      setRefreshMarker();
      channel?.postMessage({ type: 'refresh-ok' });
    } catch (error) {
      channel?.postMessage({ type: 'refresh-fail' });
      throw error;
    }
  };

  const fromLock =
    typeof navigator !== 'undefined' && navigator.locks
      ? navigator.locks.request(apiConfig.refreshLockName, () => runRefresh())
      : runRefresh();

  try {
    if (fromChannel) {
      await Promise.race([fromChannel, fromLock]);
      void fromLock.catch(() => undefined);
    } else {
      await fromLock;
    }
  } finally {
    if (channel && channelHandler) {
      channel.removeEventListener('message', channelHandler);
    }
  }
}

function beginRefreshWave(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshHold = true;
  refreshPromise = coordinatedRefresh()
    .then(() => {
      for (const item of queue) {
        if (item.held) {
          item.held = false;
          item.afterRefresh = true;
          item.inFlight = false;
        }
      }
      refreshHold = false;
      refreshPromise = null;
      pump();
    })
    .catch((error: unknown) => {
      refreshPromise = null;
      refreshHold = false;
      forceLogout(error);
    });
  return refreshPromise;
}

async function sendItem(item: QueueItem): Promise<void> {
  if (item.inFlight || item.held || !canDispatch()) {
    return;
  }
  item.inFlight = true;

  const runAdapter = async (): Promise<AxiosResponse> => {
    if (!canDispatch()) {
      throw DISPATCH_DEFER;
    }
    return defaultAdapter(item.config);
  };

  try {
    const response = isGet(item.config)
      ? await limitGet(runAdapter)
      : await runAdapter();
    item.inFlight = false;
    removeItem(item);
    item.resolve(response);
    pump();
  } catch (error: unknown) {
    item.inFlight = false;
    if (error === DISPATCH_DEFER) {
      pump();
      return;
    }
    handleFailure(item, error);
  }
}

function handleFailure(item: QueueItem, error: unknown): void {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;

  if (status !== 401) {
    removeItem(item);
    item.reject(error);
    pump();
    return;
  }

  if (
    mode === 'passthrough' ||
    isBlacklisted(item.config) ||
    item.afterRefresh
  ) {
    removeItem(item);
    item.reject(error);
    pump();
    return;
  }

  item.held = true;
  void beginRefreshWave();
  pump();
}

function pump(): void {
  if (!canDispatch()) {
    return;
  }

  for (const item of queue) {
    if (item.inFlight || item.held) {
      continue;
    }
    void sendItem(item);
  }
}

export function enqueueRequest(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  return new Promise<AxiosResponse>((resolve, reject) => {
    const item: QueueItem = {
      config,
      resolve,
      reject,
      inFlight: false,
      held: false,
      afterRefresh: false,
    };
    queue.push(item);
    pump();
  });
}

export function getManagerMode(): ManagerMode {
  return mode;
}

async function doInit(): Promise<void> {
  mode = 'boot';
  refreshHold = false;
  getBroadcast();

  try {
    const { data } = await transport.get<0 | 1>('/auth/check');
    if (data === 1) {
      mode = 'auth';
    } else {
      try {
        await transport.post('/auth/refresh');
        setRefreshMarker();
        mode = 'auth';
      } catch {
        mode = 'passthrough';
      }
    }
  } catch {
    try {
      await transport.post('/auth/refresh');
      setRefreshMarker();
      mode = 'auth';
    } catch {
      mode = 'passthrough';
    }
  }

  pump();
}

export function initHttpManager(): Promise<void> {
  if (!initPromise) {
    initPromise = doInit();
  }
  return initPromise;
}
