import {
  VireoDndProvider,
  VireoDragHandle,
  VireoDraggableItem,
  VireoDropZone,
} from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "lane", laneId: "planned" }} mode="reorder">
          <VireoDraggableItem
            id={{ type: "task", taskId: "release" }}
            index={0}
            dragHandle="explicit"
            slots={{ root: "article" }}
          >
            <Paper variant="outlined" sx={{ width: 360, p: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                <VireoDragHandle aria-label="Move release task" />
                <Typography>Prepare release</Typography>
              </Stack>
            </Paper>
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
