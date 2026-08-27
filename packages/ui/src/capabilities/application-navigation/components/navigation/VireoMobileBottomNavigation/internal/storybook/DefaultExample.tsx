import { DashboardOutlined, Inventory2Outlined, SettingsOutlined, TuneRounded } from "@mui/icons-material";
import { Box } from "@mui/material";
import { VireoMobileBottomNavigation } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const items = [
  { value: "/", label: "Overview", icon: <DashboardOutlined /> },
  { value: "/items", label: "Items", icon: <Inventory2Outlined /> },
  { value: "/settings", label: "Settings", icon: <SettingsOutlined /> },
  { value: "/dev-tools", label: "Dev tools", icon: <TuneRounded /> },
] as const;

export default function DefaultExample() {
  const [value, setValue] = React.useState("/items");

  return (
    <VireoStorybookProvider>
      <Box sx={{ maxWidth: 440, mx: "auto", pt: 12 }}>
        <VireoMobileBottomNavigation items={items} value={value} onChange={setValue} />
      </Box>
    </VireoStorybookProvider>
  );
}
