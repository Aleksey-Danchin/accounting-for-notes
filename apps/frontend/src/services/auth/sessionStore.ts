import { create } from 'zustand';
import type { AuthController } from '__backend/src/auth/auth.controller';
import { meRequest } from './authApi';

export type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous';

export type SessionFlags = {
  isIdle: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
};

function flagsFor(
  status: SessionStatus,
  user: Awaited<ReturnType<AuthController['me']>> | null,
): SessionFlags {
  return {
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && user !== null,
    isAnonymous: status === 'anonymous',
  };
}

type SessionState = SessionFlags & {
  user: Awaited<ReturnType<AuthController['me']>> | null;
  status: SessionStatus;
  setUser: (
    user: Awaited<ReturnType<AuthController['me']>> | null,
  ) => void;
  bootstrap: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  status: 'idle',
  ...flagsFor('idle', null),
  setUser: (user) => {
    const status: SessionStatus = user ? 'authenticated' : 'anonymous';
    set({ user, status, ...flagsFor(status, user) });
  },
  bootstrap: async () => {
    if (get().isLoading) {
      return;
    }
    set({ status: 'loading', ...flagsFor('loading', get().user) });
    const user = await meRequest();
    const status: SessionStatus = user ? 'authenticated' : 'anonymous';
    set({ user, status, ...flagsFor(status, user) });
  },
}));
