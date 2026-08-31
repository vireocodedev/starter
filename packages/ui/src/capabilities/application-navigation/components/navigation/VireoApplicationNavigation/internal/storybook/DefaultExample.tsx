import { DashboardOutlined, Inventory2Outlined, SettingsOutlined } from "@mui/icons-material";
import { Box, Button, Divider, List, ListItem, Typography } from "@mui/material";
import {
  VireoApplicationNavigation,
  VireoApplicationNavigationItem,
  type VireoApplicationNavigationMode,
} from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const destinations = [
  { label: "Overview", href: "#overview", icon: <DashboardOutlined /> },
  { label: "Inventory", href: "#inventory", icon: <Inventory2Outlined /> },
  { label: "Settings", href: "#settings", icon: <SettingsOutlined /> },
];

export default function DefaultExample() {
  const [mode, setMode] = React.useState<VireoApplicationNavigationMode>("expanded");
  const [width, setWidth] = React.useState(280);

  return (
    <VireoStorybookProvider>
      <Box sx={{ display: "flex", height: 480, overflow: "hidden" }}>
        <VireoApplicationNavigation
          navigationLabel="Primary navigation"
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
                  <ListItem disablePadding key={destination.label}>
                    <VireoApplicationNavigationItem
                      href={destination.href}
                      icon={destination.icon}
                      label={destination.label}
                      selected={index === 0}
                    />
                  </ListItem>
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
