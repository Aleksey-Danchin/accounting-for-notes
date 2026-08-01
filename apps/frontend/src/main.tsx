import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient } from "./global/queryClient";
import { router } from "./global/router";
import { getRoot } from "./global/getRoot";
import { AuthBootstrap } from "__frontend/services/auth";
import "./index.css";

createRoot(getRoot()).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </QueryClientProvider>
  </StrictMode>,
);
