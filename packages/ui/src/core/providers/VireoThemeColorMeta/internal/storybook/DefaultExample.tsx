import { VireoThemeColorMeta } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Paper, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import React from "react";

export default function DefaultExample() {
  const [mode, setMode] = React.useState<"dark" | "light">("dark");
  const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <VireoThemeColorMeta />
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 520 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Browser theme color</Typography>
            <Typography color="text.secondary">
              The unqualified theme-color meta tag currently follows the {mode} theme paper color.
            </Typography>
            <Button onClick={() => setMode(value => (value === "dark" ? "light" : "dark"))}>Toggle theme</Button>
          </Stack>
        </Paper>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
