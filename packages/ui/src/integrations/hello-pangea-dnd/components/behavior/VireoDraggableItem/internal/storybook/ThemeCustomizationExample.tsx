import { VireoDndProvider, VireoDraggableItem, VireoDropZone } from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: { VireoDraggableItem: { styleOverrides: { root: { borderRadius: 12 }, dragging: { opacity: 0.88 } } } },
  });
}
export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoDndProvider onDragEnd={() => undefined}>
          <VireoDropZone id={{ type: "lane", laneId: "theme" }} mode="reorder">
            <VireoDraggableItem id={{ type: "task", taskId: "theme" }} index={0}>
              <Paper sx={{ p: 2, width: 340 }}>Theme-owned drag feedback</Paper>
            </VireoDraggableItem>
          </VireoDropZone>
        </VireoDndProvider>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
