import { useResponsiveProps } from "@/hooks/useResponsiveProps";
import { useTheme } from "@mui/material";
import { type RgoProvider } from "@/providers/RgoProviders";
import { Toaster, type ToasterProps } from "sonner";

/**
 * @see {@link https://sonner.emilkowal.ski/getting-started|sonner toast API}
 */
export const AppSnackbarProvider: RgoProvider = ({ children }) => {
  const theme = useTheme();

  const toasterProps = useResponsiveProps<ToasterProps>({
    mobile: {
      position: "top-right",
      toastOptions: { style: { height: 49 } },
      closeButton: false,
      swipeDirections: ["right"],
      mobileOffset: { top: 8 },
    },
    desktop: {
      position: "bottom-center",
      closeButton: true,
      swipeDirections: ["bottom"],
    },
  });

  return (
    <>
      {children}
      <Toaster
        {...toasterProps}
        className="app-snackbar-toaster"
        duration={2500}
        richColors
        theme={theme.palette.mode}
      />
    </>
  );
};
