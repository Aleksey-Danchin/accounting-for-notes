import { useEffect, type ReactNode } from 'react';
import { useSessionStore } from './sessionStore';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const bootstrap = useSessionStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return children;
}
