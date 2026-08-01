import { createLazyFileRoute, Link } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Accounting for notes</h1>
      <p className="text-base-content/70">
        Local stack smoke: frontend aliases → API → Prisma → Postgres.
      </p>
      <p>
        <Link to="/users" className="link link-primary">
          Open users
        </Link>
      </p>
    </div>
  );
}
