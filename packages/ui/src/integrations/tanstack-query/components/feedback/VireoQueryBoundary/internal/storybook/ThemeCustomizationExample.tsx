import { VireoQueryBoundary } from "@vireocodedev/ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function PendingContent(): never {
  throw new Promise(() => undefined);
}

export default function ThemeCustomizationExample() {
  const [client] = React.useState(() => new QueryClient());
  const outerTheme = useTheme();
  const theme = React.useMemo(
    () =>
      createTheme(outerTheme, {
        components: {
          VireoQueryBoundary: {
            defaultProps: { loadingLabel: "Loading branded workspace" },
            styleOverrides: { root: { border: "1px solid", borderColor: "#7c4dff", borderRadius: 16 } },
            variants: [{ props: () => true, style: { backgroundColor: outerTheme.vireo.surface.sunken } }],
          },
        },
      }),
    [outerTheme],
  );
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={client}>
          <VireoQueryBoundary>
            <PendingContent />
          </VireoQueryBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
