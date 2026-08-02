import { type RgoProvider } from "@/providers/RgoProviders";
import { Toaster, type ToastOptions, type ToasterProps } from "react-hot-toast";
import "./RgoSnackbarProvider.css";

export type RgoSnackbarProviderProps = Partial<{
  position: ToasterProps["position"];
  duration: ToastOptions["duration"];
}>;

export const RgoSnackbarProvider: RgoProvider<RgoSnackbarProviderProps> = ({
  position = "bottom-center",
  duration = 5000,
  children,
}) => {
  return (
    <>
      {children}
      <Toaster
        position={position}
        toastOptions={{
          duration,
        }}
      />
    </>
  );
};
