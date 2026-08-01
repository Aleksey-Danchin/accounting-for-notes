import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PagePending } from "../components/PagePending";

export const router = createRouter({
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
  defaultPendingComponent: PagePending,
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
