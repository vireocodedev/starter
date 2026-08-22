import {
  VireoDndProvider,
  VireoDragHandle,
  VireoDraggableItem,
  VireoDropZone,
} from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function InteractiveDescendantsExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "lane", laneId: "editable" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "editable" }} index={0} dragHandle="explicit">
            <Paper variant="outlined" sx={{ p: 1.5, width: 440 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <VireoDragHandle aria-label="Move editable task" />
                <TextField size="small" defaultValue="Editable task" inputProps={{ "aria-label": "Task title" }} />
                <Button size="small">Open</Button>
                <Typography variant="caption" color="text.secondary">
                  Only the grip drags
                </Typography>
              </Stack>
            </Paper>
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
