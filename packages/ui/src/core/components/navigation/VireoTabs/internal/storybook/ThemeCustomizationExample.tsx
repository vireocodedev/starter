import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoTabs } from "@vireocodedev/starter-ui";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoTabs: {
        styleOverrides: {
          root: {
            border: "1px solid #64748b",
            borderRadius: 12,
            padding: 16,
          },
          tabs: { borderBottom: "1px solid #475569" },
          tab: { color: "#cbd5e1", fontWeight: 700 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoTabs
          tabs={[
            { value: "summary", label: "Summary", content: "Theme-level styles apply across every instance." },
            { value: "history", label: "History", content: "No per-instance styling is required." },
          ]}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
