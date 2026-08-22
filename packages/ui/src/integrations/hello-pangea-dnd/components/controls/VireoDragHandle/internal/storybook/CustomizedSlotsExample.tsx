import {
  VireoDndProvider,
  VireoDragHandle,
  VireoDraggableItem,
  VireoDropZone,
} from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import DragHandleRounded from "@mui/icons-material/DragHandleRounded";
import { Paper, Stack, Typography } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "lane", laneId: "custom" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "custom" }} index={0} dragHandle="explicit">
            <Paper variant="outlined" sx={{ p: 1, width: 360 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <VireoDragHandle
                  aria-label="Move customized task"
                  slots={{ icon: DragHandleRounded }}
                  slotProps={{ root: { color: "primary" } }}
                />
                <Typography>Customized grip</Typography>
              </Stack>
            </Paper>
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
