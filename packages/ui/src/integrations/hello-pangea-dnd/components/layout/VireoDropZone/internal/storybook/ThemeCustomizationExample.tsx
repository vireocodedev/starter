import { VireoDndProvider, VireoDropZone } from "@vireocodedev/ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoDropZone: {
        styleOverrides: {
          root: { borderRadius: 16, color: "#c4b5fd", fontWeight: 700 },
          candidate: { outlineColor: "#a78bfa" },
          over: { outlineColor: "#8b5cf6" },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoDndProvider onDragEnd={() => undefined}>
          <VireoDropZone id={{ type: "task-list", listId: "themed" }} mode="transfer" sx={{ minHeight: 120, p: 2 }}>
            Themed destination
          </VireoDropZone>
        </VireoDndProvider>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
