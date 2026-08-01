import type { ReactNode } from 'react';
import type { AuthController } from '__backend/src/auth/auth.controller';
import { useSessionStore } from './sessionStore';
import { resolveRenderable, type Renderable } from './utils';

type AuthGuardProps = {
  fallback?: Renderable;
  loading?: Renderable;
  children:
    | ReactNode
    | ((user: Awaited<ReturnType<AuthController['me']>>) => ReactNode);
};

export function AuthGuard({ fallback, loading, children }: AuthGuardProps) {
  const user = useSessionStore((s) => s.user);
  const isIdle = useSessionStore((s) => s.isIdle);
  const isLoading = useSessionStore((s) => s.isLoading);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const checking = isIdle || isLoading;

  const hasFallback = fallback !== undefined;
  const hasLoading = loading !== undefined;

  if (hasFallback && hasLoading) {
    if (checking) {
      return <>{resolveRenderable(loading)}</>;
    }
    if (!isAuthenticated) {
      return <>{resolveRenderable(fallback)}</>;
    }
  } else if (hasFallback && !hasLoading) {
    if (!isAuthenticated) {
      return <>{resolveRenderable(fallback)}</>;
    }
  } else if (!hasFallback && hasLoading) {
    if (checking) {
      return <>{resolveRenderable(loading)}</>;
    }
  }

  if (typeof children === 'function') {
    if (!user) {
      return null;
    }
    return <>{children(user)}</>;
  }

  return <>{children}</>;
}
