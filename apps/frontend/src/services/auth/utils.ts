import type { ReactNode } from "react";
import axios from "axios";

export type Renderable = ReactNode | (() => ReactNode);

export function resolveRenderable(value: Renderable): ReactNode {
  if (value === undefined) {
    return null;
  }

  return typeof value === "function" ? value() : value;
}

export function loginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { message?: string | unknown } | undefined;
    if (typeof data?.message === "string") {
      return data.message;
    }
    if (error.response?.status === 401) {
      return "Invalid email or password";
    }
    if (error.response?.status === 400) {
      return "Invalid login data";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Login failed";
}
