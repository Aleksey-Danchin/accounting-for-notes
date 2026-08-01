import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth-test/')({
  // Needed so defaultPendingComponent shows while the lazy chunk loads.
  loader: () => null,
});
