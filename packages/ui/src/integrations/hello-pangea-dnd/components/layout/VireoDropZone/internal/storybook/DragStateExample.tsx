import {
  VireoDndProvider,
  VireoDraggableItem,
  VireoDropZone,
  useVireoDndState,
} from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Chip, Paper, Stack } from "@mui/material";

function StateIndicator() {
  const state = useVireoDndState();
  return (
    <Chip
      color={state.isDragging ? "primary" : "default"}
      label={state.isDragging ? `Dragging ${state.active?.draggable.type}` : "Idle"}
    />
  );
}

export default function DragStateExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <Stack spacing={2}>
          <StateIndicator />
          <VireoDropZone id={{ type: "list", listId: "state" }} mode="reorder" sx={{ width: 320 }}>
            <VireoDraggableItem id={{ type: "task", taskId: "observe" }} index={0}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                Drag to inspect state
              </Paper>
            </VireoDraggableItem>
          </VireoDropZone>
        </Stack>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
