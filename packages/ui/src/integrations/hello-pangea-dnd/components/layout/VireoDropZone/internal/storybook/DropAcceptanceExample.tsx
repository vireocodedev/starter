import { VireoDndProvider, VireoDraggableItem, VireoDropZone } from "@vireocodedev/ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";

export default function DropAcceptanceExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <VireoDropZone
            id={{ type: "task-list", listId: "source" }}
            mode="reorder"
            group="priority"
            sx={{ width: 280, p: 1 }}
          >
            <VireoDraggableItem id={{ type: "task", taskId: "security", priority: "high" }} index={0}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                Security review · high
              </Paper>
            </VireoDraggableItem>
          </VireoDropZone>
          <VireoDropZone
            id={{ type: "task-list", listId: "urgent" }}
            mode="transfer"
            group="priority"
            canDrop={({ draggable }) => draggable.priority === "high"}
            sx={{ width: 280, minHeight: 100, p: 2 }}
          >
            <Typography>High-priority tasks only</Typography>
          </VireoDropZone>
        </Stack>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
