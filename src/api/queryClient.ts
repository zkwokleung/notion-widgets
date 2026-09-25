import { QueryClient } from "@tanstack/react-query";
import { shouldRetry } from "./client";

export function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } });
}
