import { VireoDndProvider, VireoDraggableItem, VireoDropZone } from "@vireocodedev/ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";

export default function DisabledStatesExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <VireoDropZone id={{ type: "list", listId: "mixed" }} mode="reorder" sx={{ width: 280, p: 1 }}>
            <Stack spacing={1}>
              <VireoDraggableItem id={{ type: "task", taskId: "movable" }} index={0}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  Movable
                </Paper>
              </VireoDraggableItem>
              <VireoDraggableItem id={{ type: "task", taskId: "locked" }} index={1} disabled>
                <Paper variant="outlined" sx={{ p: 1.5, opacity: 0.6 }}>
                  Locked item
                </Paper>
              </VireoDraggableItem>
            </Stack>
          </VireoDropZone>
          <VireoDropZone id={{ type: "list", listId: "disabled" }} mode="transfer" disabled sx={{ width: 260, p: 2 }}>
            <Typography>Disabled destination</Typography>
          </VireoDropZone>
        </Stack>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
