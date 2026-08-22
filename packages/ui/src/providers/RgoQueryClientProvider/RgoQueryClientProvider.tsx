import { type QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import "./RgoQueryClientProvider.css";

export type RgoQueryClientProviderProps = React.PropsWithChildren<{
  client: QueryClient;
}>;

export function RgoQueryClientProvider({ children, client }: RgoQueryClientProviderProps) {
  return <TanstackQueryClientProvider client={client}>{children}</TanstackQueryClientProvider>;
}
