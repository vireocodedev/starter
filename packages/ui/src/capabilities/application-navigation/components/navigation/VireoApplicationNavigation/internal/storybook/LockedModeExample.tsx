import { DashboardOutlined, SettingsOutlined } from "@mui/icons-material";
import { Box, List, Typography } from "@mui/material";
import { VireoApplicationNavigation, VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function LockedModeExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ display: "flex", height: 360, overflow: "hidden" }}>
        <VireoApplicationNavigation mode="compact" locked>
          <List sx={{ px: 1, py: 2 }}>
            <VireoApplicationNavigationItem icon={<DashboardOutlined />} label="Dashboard" selected />
            <VireoApplicationNavigationItem icon={<SettingsOutlined />} label="Settings" />
          </List>
        </VireoApplicationNavigation>
        <Box sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6">Locked compact navigation</Typography>
          <Typography color="text.secondary">
            Locking preserves the selected mode while disabling toggles and resizing.
          </Typography>
        </Box>
      </Box>
    </VireoStorybookProvider>
  );
}
