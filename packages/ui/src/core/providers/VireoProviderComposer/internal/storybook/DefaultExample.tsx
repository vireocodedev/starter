import { VireoIconRegistryProvider, VireoProviderComposer, type VireoProviderWrapper } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { CssBaseline, Paper, Stack, ThemeProvider, Typography, createTheme, useTheme } from "@mui/material";
import React from "react";

const WorkspaceContext = React.createContext<string | null>(null);

export default function DefaultExample() {
  const outerTheme = useTheme();
  const theme = React.useMemo(() => createTheme(outerTheme), [outerTheme]);
  const providers = [
    children => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    ),
    children => <VireoIconRegistryProvider>{children}</VireoIconRegistryProvider>,
    children => <WorkspaceContext.Provider value="Northstar">{children}</WorkspaceContext.Provider>,
  ] satisfies readonly VireoProviderWrapper[];

  return (
    <VireoStorybookProvider>
      <VireoProviderComposer providers={providers}>
        <WorkspaceSummary />
      </VireoProviderComposer>
    </VireoStorybookProvider>
  );
}

function WorkspaceSummary() {
  const workspace = React.useContext(WorkspaceContext);
  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 520 }}>
      <Stack spacing={1}>
        <Typography variant="h6">Application providers</Typography>
        <Typography color="text.secondary">Current workspace: {workspace}</Typography>
      </Stack>
    </Paper>
  );
}
