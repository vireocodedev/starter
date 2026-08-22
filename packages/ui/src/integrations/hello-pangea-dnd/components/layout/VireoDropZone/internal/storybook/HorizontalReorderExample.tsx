import { VireoDndProvider, VireoDraggableItem, VireoDropZone } from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, Stack } from "@mui/material";

export default function HorizontalReorderExample() {
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "toolbar", toolbarId: "primary" }} mode="reorder" direction="horizontal">
          <Stack direction="row" spacing={1}>
            {["Back", "Refresh", "Share"].map((label, index) => (
              <VireoDraggableItem key={label} id={{ type: "action", actionId: label }} index={index}>
                <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
                  {label}
                </Paper>
              </VireoDraggableItem>
            ))}
          </Stack>
        </VireoDropZone>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
