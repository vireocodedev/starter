import { VireoDndProvider, VireoDraggableItem, VireoDropZone } from "@vireocodedev/ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Button, Paper, Stack, Typography } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "lane", laneId: "todo" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "review" }} index={0}>
            <Paper variant="outlined" sx={{ p: 2, width: 360 }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Review pull request</Typography>
                <Button size="small">Open</Button>
              </Stack>
            </Paper>
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
