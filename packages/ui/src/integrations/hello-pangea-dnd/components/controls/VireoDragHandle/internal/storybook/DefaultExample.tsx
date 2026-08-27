import {
  VireoDndProvider,
  VireoDragHandle,
  VireoDraggableItem,
  VireoDropZone,
} from "@vireocodedev/ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "lane", laneId: "default" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "accessible" }} index={0} dragHandle="explicit">
            <Paper variant="outlined" sx={{ p: 1, width: 360 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                <VireoDragHandle aria-label="Move accessibility review" />
                <Typography>Accessibility review</Typography>
              </Stack>
            </Paper>
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
