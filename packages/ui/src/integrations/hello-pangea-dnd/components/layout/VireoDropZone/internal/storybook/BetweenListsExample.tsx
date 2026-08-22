import {
  VireoDndProvider,
  VireoDraggableItem,
  VireoDropZone,
  type VireoDndDragEndResult,
} from "@vireocodedev/starter-ui/hello-pangea-dnd";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, Stack, Typography } from "@mui/material";
import React from "react";

const initialLanes = { backlog: ["Design audit", "Write migration"], active: ["Ship DnD"] };

export default function BetweenListsExample() {
  const [lanes, setLanes] = React.useState(initialLanes);
  function handleDragEnd(result: VireoDndDragEndResult) {
    if (result.reason !== "drop" || !result.destination) return;
    const sourceId = result.source.id.listId as keyof typeof lanes;
    const destinationId = result.destination.id.listId as keyof typeof lanes;
    setLanes(current => {
      const next = { backlog: [...current.backlog], active: [...current.active] };
      const [task] = next[sourceId].splice(result.source.index, 1);
      next[destinationId].splice(result.destination!.index, 0, task);
      return next;
    });
  }
  return (
    <VireoStorybookProvider>
      <VireoDndProvider onDragEnd={handleDragEnd}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {(Object.keys(lanes) as Array<keyof typeof lanes>).map(lane => (
            <Stack key={lane} spacing={1} sx={{ width: 300 }}>
              <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
                {lane}
              </Typography>
              <VireoDropZone
                id={{ type: "task-list", listId: lane }}
                mode="reorder"
                group="workflow"
                sx={{ minHeight: 130, p: 1 }}
              >
                <Stack spacing={1}>
                  {lanes[lane].map((task, index) => (
                    <VireoDraggableItem key={task} id={{ type: "task", taskId: task }} index={index}>
                      <Paper variant="outlined" sx={{ p: 1.5 }}>
                        {task}
                      </Paper>
                    </VireoDraggableItem>
                  ))}
                </Stack>
              </VireoDropZone>
            </Stack>
          ))}
        </Stack>
      </VireoDndProvider>
    </VireoStorybookProvider>
  );
}
