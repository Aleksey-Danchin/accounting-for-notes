import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  // Needed so defaultPendingComponent shows while the lazy chunk loads.
  loader: () => null,
});
