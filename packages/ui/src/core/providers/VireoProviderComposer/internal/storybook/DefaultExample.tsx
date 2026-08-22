import { VireoIconRegistryProvider, VireoProviderComposer, type VireoProviderWrapper } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { CssBaseline, Paper, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import React from "react";

const WorkspaceContext = React.createContext<string | null>(null);
const theme = createTheme({ palette: { mode: "dark", primary: { main: "#36c7fa" } } });

export default function DefaultExample() {
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
