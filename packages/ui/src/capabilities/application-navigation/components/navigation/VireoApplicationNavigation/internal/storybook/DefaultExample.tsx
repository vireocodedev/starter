import { DashboardOutlined, Inventory2Outlined, SettingsOutlined } from "@mui/icons-material";
import { Box, Button, Divider, List, Typography } from "@mui/material";
import {
  VireoApplicationNavigation,
  VireoApplicationNavigationItem,
  type VireoApplicationNavigationMode,
} from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const destinations = [
  { label: "Overview", icon: <DashboardOutlined /> },
  { label: "Inventory", icon: <Inventory2Outlined /> },
  { label: "Settings", icon: <SettingsOutlined /> },
];

export default function DefaultExample() {
  const [mode, setMode] = React.useState<VireoApplicationNavigationMode>("expanded");
  const [width, setWidth] = React.useState(280);

  return (
    <VireoStorybookProvider>
      <Box sx={{ display: "flex", height: 480, overflow: "hidden" }}>
        <VireoApplicationNavigation
          mode={mode}
          expandedWidth={width}
          onModeChange={setMode}
          onExpandedWidthChange={setWidth}
        >
          {({ mode: activeMode, toggleMode }) => (
            <>
              <Box sx={{ px: activeMode === "compact" ? 1 : 2, py: 2 }}>
                <Typography align={activeMode === "compact" ? "center" : "left"} sx={{ fontWeight: 800 }}>
                  {activeMode === "compact" ? "V" : "Vireo Workspace"}
                </Typography>
                <Button fullWidth size="small" onClick={toggleMode} sx={{ mt: 1 }}>
                  {activeMode === "compact" ? "Expand" : "Compact"}
                </Button>
              </Box>
              <Divider />
              <List sx={{ display: "grid", gap: 0.5, px: 1, py: 1.5 }}>
                {destinations.map((destination, index) => (
                  <VireoApplicationNavigationItem
                    key={destination.label}
                    icon={destination.icon}
                    label={destination.label}
                    selected={index === 0}
                  />
                ))}
              </List>
            </>
          )}
        </VireoApplicationNavigation>
        <Box sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6">Application workspace</Typography>
          <Typography color="text.secondary">Drag the navigation edge or use the compact action.</Typography>
        </Box>
      </Box>
    </VireoStorybookProvider>
  );
}
