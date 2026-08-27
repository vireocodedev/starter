import {
  VireoDndProvider,
  VireoDraggableItem,
  VireoDropZone,
  type VireoDndDragEndResult,
} from "@vireocodedev/ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";
import React from "react";

const initialTasks = ["Plan release", "Review accessibility", "Publish changelog"];

export default function DefaultExample() {
  const [tasks, setTasks] = React.useState(initialTasks);
  function handleDragEnd(result: VireoDndDragEndResult) {
    if (result.reason !== "drop" || !result.destination) return;
    setTasks(current => {
      const next = [...current];
      const [moved] = next.splice(result.source.index, 1);
      next.splice(result.destination!.index, 0, moved);
      return next;
    });
  }
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={handleDragEnd}>
        <Stack spacing={1.5} sx={{ width: 380 }}>
          <Typography variant="h6">Release tasks</Typography>
          <VireoDropZone id={{ type: "task-list", listId: "release" }} mode="reorder">
            <Stack spacing={1}>
              {tasks.map((task, index) => (
                <VireoDraggableItem key={task} id={{ type: "task", taskId: task }} index={index}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    {task}
                  </Paper>
                </VireoDraggableItem>
              ))}
            </Stack>
          </VireoDropZone>
        </Stack>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
