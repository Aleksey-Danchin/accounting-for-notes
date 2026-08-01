import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-dvh bg-base-100">
      <main className="flex min-h-dvh flex-1 flex-col p-6">
        <nav className="mb-6 flex shrink-0 gap-4 text-sm">
          <Link to="/" className="link link-hover">
            Home
          </Link>
          <Link to="/users" className="link link-hover">
            Users
          </Link>
          <Link to="/notes" className="link link-hover">
            Notes
          </Link>
          <Link to="/tags" className="link link-hover">
            Tags
          </Link>
          <Link to="/actions" className="link link-hover">
            Actions
          </Link>
          <Link to="/auth-test" className="link link-hover">
            Auth test
          </Link>
        </nav>
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </main>

      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  ),
});
