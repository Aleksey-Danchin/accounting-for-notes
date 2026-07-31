import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen bg-base-100">
      <main className="flex-1 p-6">
        <nav className="mb-6 flex gap-4 text-sm">
          <Link to="/" className="link link-hover">
            Home
          </Link>
          <Link to="/users" className="link link-hover">
            Users
          </Link>
        </nav>
        <Outlet />
      </main>

      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  ),
});
