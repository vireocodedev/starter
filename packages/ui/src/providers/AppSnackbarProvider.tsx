import { useMediaQuery, useTheme } from "@mui/material";
import { Toaster, type ToasterProps } from "sonner";
import type React from "react";

/**
 * @see {@link https://sonner.emilkowal.ski/getting-started|sonner toast API}
 */
export function AppSnackbarProvider({ children }: React.PropsWithChildren) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toasterProps: ToasterProps = mobile
    ? {
        position: "top-right",
        toastOptions: { style: { height: 49 } },
        closeButton: false,
        swipeDirections: ["right"],
        mobileOffset: { top: 8 },
      }
    : {
        position: "bottom-center",
        closeButton: true,
        swipeDirections: ["bottom"],
      };

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
}
