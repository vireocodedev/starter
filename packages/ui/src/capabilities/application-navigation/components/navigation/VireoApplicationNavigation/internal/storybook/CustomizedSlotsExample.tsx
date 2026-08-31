import { HomeOutlined } from "@mui/icons-material";
import { Box, List, ListItem } from "@mui/material";
import { VireoApplicationNavigation, VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ display: "flex", height: 360, overflow: "hidden" }}>
        <VireoApplicationNavigation
          navigationLabel="Primary navigation"
          mode="compact"
          resizable={false}
          slots={{ root: "aside" }}
          slotProps={{
            root: { "data-navigation-shell": "compact" },
            content: { sx: { bgcolor: "background.default", pt: 2 } },
          }}
        >
          <List sx={{ px: 1 }}>
            <ListItem disablePadding>
              <VireoApplicationNavigationItem
                href="#dashboard"
                icon={<HomeOutlined />}
                label="Dashboard"
                compactLabel="Home"
                selected
              />
            </ListItem>
          </List>
        </VireoApplicationNavigation>
        <Box sx={{ flex: 1, p: 3 }}>Custom root and content slots</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
