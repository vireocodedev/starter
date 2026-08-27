import { DashboardOutlined, Inventory2Outlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={1} sx={{ maxWidth: 320 }}>
        <VireoApplicationNavigationItem icon={<DashboardOutlined />} label="Overview" selected />
        <VireoApplicationNavigationItem icon={<Inventory2Outlined />} label="Inventory" />
      </Stack>
    </VireoStorybookProvider>
  );
}
