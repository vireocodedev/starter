import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import { VireoSlidingScreenStack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function DraftScreen({ onReview }: { onReview: () => void }) {
  const [editCount, setEditCount] = React.useState(0);

  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h6">Draft proposal</Typography>
      <Typography>Draft edits: {editCount}</Typography>
      <Button onClick={() => setEditCount(count => count + 1)}>Add draft edit</Button>
      <Button variant="contained" onClick={onReview}>
        Review draft
      </Button>
    </Stack>
  );
}

export default function PreservedScreenStateExample() {
  const [activeScreen, setActiveScreen] = React.useState("draft");
  const screens = [
    { id: "draft", children: <DraftScreen onReview={() => setActiveScreen("review")} /> },
    {
      id: "review",
      children: (
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h6">Review proposal</Typography>
          <Typography color="text.secondary">The draft screen remains mounted outside the viewport.</Typography>
          <Button onClick={() => setActiveScreen("draft")}>Return to draft</Button>
        </Stack>
      ),
    },
  ];

  return (
    <VireoStorybookProvider>
      <VireoSlidingScreenStack activeScreen={activeScreen} screens={screens} sx={{ minHeight: 240, p: 3 }} />
    </VireoStorybookProvider>
  );
}
