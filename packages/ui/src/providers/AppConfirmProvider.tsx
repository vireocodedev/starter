import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { type RgoProvider } from "@/providers/RgoProviders";

export const AppConfirmProvider: RgoProvider = ({ children }) => {
  return <RgoConfirmProvider>{children}</RgoConfirmProvider>;
};
