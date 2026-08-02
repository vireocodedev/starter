import { QueryClient, type UseBaseQueryOptions } from "@tanstack/react-query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RgoQueryOptionsFactoryCollection = Record<string, (...args: any[]) => UseBaseQueryOptions>;

export function configureQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false, // <- stops refetch when tab gains focus
        refetchOnReconnect: false, // optional: stops refetch when internet reconnects
        // If you still see loaders, your data may be considered stale immediately:
        //staleTime: 5 * 60 * 1000,      // optional: keep fresh for 5 min
      },
    },
  });
}
