import { VireoToaster, toast } from "@vireocodedev/ui/sonner";
import { Button, Stack, ThemeProvider, Typography, createTheme, useTheme } from "@mui/material";
import React from "react";

const toasterId = "theme-customization";
export default function ThemeCustomizationExample() {
  const outerTheme = useTheme();
  const theme = React.useMemo(
    () =>
      createTheme(outerTheme, {
        shape: { borderRadius: 14 },
        components: {
          VireoToaster: {
            defaultProps: { duration: 5000 },
            styleOverrides: { root: { "& [data-sonner-toast]": { borderInlineStart: "4px solid #a78bfa" } } },
          },
        },
      }),
    [outerTheme],
  );
  return (
    <ThemeProvider theme={theme}>
      <Stack
        spacing={2}
        sx={{
          alignItems: "flex-start",
          minHeight: 480,
          width: "100%",
        }}
      >
        <Typography variant="h6">Branded notifications</Typography>
        <Button variant="contained" onClick={() => toast.success("Release published", { toasterId })}>
          Publish release
        </Button>
        <VireoToaster id={toasterId} />
      </Stack>
    </ThemeProvider>
  );
}
