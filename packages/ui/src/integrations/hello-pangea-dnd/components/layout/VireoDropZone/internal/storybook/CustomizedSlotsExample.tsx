import { VireoDndProvider, VireoDropZone } from "@vireocodedev/ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Typography } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone
          id={{ type: "task-list", listId: "archive" }}
          mode="transfer"
          slots={{ root: "section" }}
          slotProps={{
            root: {
              "aria-label": "Archive drop zone",
              sx: { border: 1, borderColor: "primary.main", borderRadius: 2, p: 3 },
            },
          }}
        >
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography>Drop completed work here</Typography>
          </Paper>
        </VireoDropZone>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
