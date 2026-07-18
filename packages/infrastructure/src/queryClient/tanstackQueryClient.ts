import { isAppOfflineError } from "@/network/appNetworkStatus";
import { QueryClient } from "@tanstack/react-query";

export const TANSTACK_QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "always",
      retry: (failureCount, error) => !isAppOfflineError(error) && failureCount < 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
