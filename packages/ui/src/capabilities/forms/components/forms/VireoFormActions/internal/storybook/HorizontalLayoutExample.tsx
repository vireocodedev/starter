import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { VireoFormActions } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import type { ReactNode } from "react";

function ActionsAtWidth({ children, label, width }: { children: ReactNode; label: string; width: number }) {
  return (
    <Box sx={{ maxWidth: width, width: "100%" }}>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <VireoFormActions>{children}</VireoFormActions>
    </Box>
  );
}

export default function HorizontalLayoutExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
        <ActionsAtWidth label="Wide container · equal-width action pair" width={640}>
          <Button>Cancel</Button>
          <Button variant="contained">Save customer</Button>
        </ActionsAtWidth>
        <ActionsAtWidth label="Compact container · the same equal-width action pair" width={320}>
          <Button>Cancel</Button>
          <Button variant="contained">Save customer</Button>
        </ActionsAtWidth>
        <ActionsAtWidth label="Additional commands collapse into an intrinsic-width menu action" width={400}>
          <Tooltip title="More actions">
            <IconButton aria-label="More actions">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Button>Cancel</Button>
          <Button variant="contained">Save customer</Button>
        </ActionsAtWidth>
      </Stack>
    </VireoStorybookProvider>
  );
}
