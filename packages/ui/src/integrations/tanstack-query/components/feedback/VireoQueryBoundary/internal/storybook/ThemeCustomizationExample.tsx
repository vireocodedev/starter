import { VireoQueryBoundary } from "@vireocodedev/starter-ui/tanstack-query";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function PendingContent(): never {
  throw new Promise(() => undefined);
}

const theme = createTheme({
  palette: { mode: "dark" },
  components: {
    VireoQueryBoundary: {
      defaultProps: { loadingLabel: "Loading branded workspace" },
      styleOverrides: { root: { border: "1px solid", borderColor: "#7c4dff", borderRadius: 16 } },
      variants: [{ props: () => true, style: { backgroundColor: "#17142b" } }],
    },
  },
});

export default function ThemeCustomizationExample() {
  const [client] = React.useState(() => new QueryClient());
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
