import { VireoDndProvider, VireoDraggableItem, VireoDropZone } from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import ArchiveRounded from "@mui/icons-material/ArchiveRounded";
import { Paper, Stack, Typography } from "@mui/material";

export default function TransferTargetExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: "stretch",
          }}
        >
          <VireoDropZone
            id={{ type: "task-list", listId: "active" }}
            mode="reorder"
            group="tasks"
            sx={{ width: 320, p: 1 }}
          >
            <VireoDraggableItem id={{ type: "task", taskId: "completed" }} index={0}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                Completed migration
              </Paper>
            </VireoDraggableItem>
          </VireoDropZone>
          <VireoDropZone
            id={{ type: "task-list", listId: "archive" }}
            mode="transfer"
            group="tasks"
            sx={{ width: 260, minHeight: 100, display: "grid", placeItems: "center", p: 2 }}
          >
            <Stack
              sx={{
                alignItems: "center",
              }}
            >
              <ArchiveRounded />
              <Typography>Archive</Typography>
            </Stack>
          </VireoDropZone>
        </Stack>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
