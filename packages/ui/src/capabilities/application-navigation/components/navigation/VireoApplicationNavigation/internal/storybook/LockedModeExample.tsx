import { DashboardOutlined, SettingsOutlined } from "@mui/icons-material";
import { Box, List, ListItem, Typography } from "@mui/material";
import { VireoApplicationNavigation, VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function LockedModeExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ display: "flex", height: 360, overflow: "hidden" }}>
        <VireoApplicationNavigation navigationLabel="Primary navigation" mode="compact" locked>
          <List sx={{ px: 1, py: 2 }}>
            <ListItem disablePadding>
              <VireoApplicationNavigationItem
                href="#dashboard"
                icon={<DashboardOutlined />}
                label="Dashboard"
                selected
              />
            </ListItem>
            <ListItem disablePadding>
              <VireoApplicationNavigationItem href="#settings" icon={<SettingsOutlined />} label="Settings" />
            </ListItem>
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
