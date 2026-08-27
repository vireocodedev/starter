import { VireoOverlayHeader } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Box, Button, Chip, IconButton } from "@mui/material";
import type { MouseEventHandler } from "react";

export type CompleteAnatomyExampleProps = {
  onClose: MouseEventHandler<HTMLButtonElement>;
};

export default function CompleteAnatomyExample({ onClose }: CompleteAnatomyExampleProps) {
  return (
    <VireoStorybookProvider>
      <Box sx={{ width: "100%", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <VireoOverlayHeader
          title="Edit invoice"
          leadingAction={
            <IconButton aria-label="Back">
              <ArrowBack />
            </IconButton>
          }
          actions={
            <>
              <Chip label="Draft" size="small" />
              <Button size="small">Save</Button>
            </>
          }
          closeLabel="Close invoice editor"
          onClose={onClose}
        />
        <Box sx={{ minHeight: 160, p: 3, color: "text.secondary" }}>Overlay content starts here.</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
