import { DashboardOutlined, Inventory2Outlined, SettingsOutlined, TuneRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { VireoMobileBottomNavigation } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const items = [
  { value: "/", label: "Overview", icon: <DashboardOutlined /> },
  { value: "/items", label: "Items", icon: <Inventory2Outlined /> },
  { value: "/settings", label: "Settings", icon: <SettingsOutlined /> },
  { value: "/dev-tools", label: "Dev tools", icon: <TuneRounded />, disabled: true },
] as const;

export default function UnmatchedRouteExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ maxWidth: 440, mx: "auto", pt: 8 }}>
        <Typography color="text.secondary" sx={{ p: 2 }}>
          A nested detail route need not select an unrelated quick destination.
        </Typography>
        <VireoMobileBottomNavigation items={items} value={false} aria-label="Quick navigation" />
      </Box>
    </VireoStorybookProvider>
  );
}
