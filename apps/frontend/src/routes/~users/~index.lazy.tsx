import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { fetchUsers } from "__frontend/api/usersApi";
import { queryClient } from "__frontend/global/queryClient";

export const Route = createLazyFileRoute("/users/")({
  component: UsersPage,
});

function UsersPage() {
  const {
    data: users,
    isPending,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <section className="users-page">
      <h1 className="mb-6 text-2xl font-semibold">Users</h1>
      {isPending && <p>Loading…</p>}
      {error && (
        <p role="alert">
          Failed to load users:{" "}
          {error instanceof Error ? error.message : "Request failed"}
        </p>
      )}
      {users && (
        <ul className="mt-4 divide-y">
          {users.map((user) => (
            <li key={user.id} className="py-2">
              <strong>{user.email}</strong>
              <span className="text-base-content/60"> — {user.id}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn btn-primary mt-4"
        onClick={() => {
          void queryClient.resetQueries({ queryKey: ["users"] });
        }}
      >
        Reset users list cache
      </button>
    </section>
  );
}
