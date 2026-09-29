import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client.ts";

const MAX_RETRIES = 2;

/** Retries network and server errors, but never 4xx answers like a 404. */
function shouldRetry(failureCount: number, error: Error): boolean {
  const isClientError = error instanceof ApiError && error.status < 500;
  return !isClientError && failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 30_000,
      },
    },
  });
}
