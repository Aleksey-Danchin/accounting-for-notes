import { useState, type SubmitEvent } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { AuthGuard, useSession } from '__frontend/services/auth';

export const Route = createLazyFileRoute('/auth-test/')({
  component: AuthTestPage,
});

function AuthTestPage() {
  const { login, logout, isAuthenticated, user, status } = useSession();
  const [email, setEmail] = useState('root@local');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await login({ email, password });
    if (!result.success) {
      setPending(false);
      setError(result.error);
    }
  }

  async function onLogout() {
    setPending(true);
    await logout();
  }

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm text-warning">Временная тестовая страница auth</p>
        <h1 className="text-2xl font-semibold">Auth test</h1>
        <p className="text-base-content/70 text-sm">
          Статус сессии: <code>{status}</code>
        </p>
      </div>

      {isAuthenticated && user ? (
        <div className="space-y-3">
          <p>
            Вы вошли как <strong>{user.email}</strong>
          </p>
          <button
            type="button"
            className="btn btn-outline"
            disabled={pending}
            onClick={() => {
              void onLogout();
            }}
          >
            Выйти
          </button>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
          <label className="form-control w-full">
            <span className="label-text">Email</span>
            <input
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Password</span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="text-error text-sm" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            Войти
          </button>
        </form>
      )}

      <div className="border-t pt-4 space-y-2">
        <h2 className="font-medium">AuthGuard demo</h2>
        <AuthGuard
          loading={<p className="text-sm opacity-70">Проверка сессии…</p>}
          fallback={<p className="text-sm">Нужен вход (fallback)</p>}
        >
          {(sessionUser) => (
            <p className="text-sm text-success">
              Guard: авторизован как {sessionUser.email}
            </p>
          )}
        </AuthGuard>
      </div>
    </section>
  );
}
