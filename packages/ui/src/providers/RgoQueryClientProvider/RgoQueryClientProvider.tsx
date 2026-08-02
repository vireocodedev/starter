import { type RgoProvider } from "@/providers/RgoProviders";
import { type QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import "./RgoQueryClientProvider.css";

export type RgoQueryClientProviderProps = {
  client: QueryClient;
};

export const RgoQueryClientProvider: RgoProvider<RgoQueryClientProviderProps> = ({ children, client }) => {
  return <TanstackQueryClientProvider client={client}>{children}</TanstackQueryClientProvider>;
};
