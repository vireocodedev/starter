import {
  VireoDndProvider,
  VireoDragHandle,
  VireoDraggableItem,
  VireoDropZone,
} from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoDragHandle: {
        styleOverrides: { root: { color: "#fbbf24" }, dragging: { color: "#f59e0b" }, icon: { fontSize: 30 } },
      },
    },
  });
}
export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoDndProvider onDragEnd={() => undefined}>
          <VireoDropZone id={{ type: "lane", laneId: "theme" }} mode="reorder">
            <VireoDraggableItem id={{ type: "task", taskId: "theme" }} index={0} dragHandle="explicit">
              <Paper variant="outlined" sx={{ p: 1, width: 360 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VireoDragHandle aria-label="Move themed task" />
                  <Typography>Theme-owned handle</Typography>
                </Stack>
              </Paper>
            </VireoDraggableItem>
          </VireoDropZone>
        </VireoDndProvider>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
