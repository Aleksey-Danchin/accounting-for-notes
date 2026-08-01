import { useEffect, type ReactNode } from 'react';
import { initHttpManager } from '__frontend/services/api';
import { useSessionStore } from './sessionStore';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const bootstrap = useSessionStore((s) => s.bootstrap);

  useEffect(() => {
    void (async () => {
      await initHttpManager();
      await bootstrap();
    })();
  }, [bootstrap]);

  return children;
}
