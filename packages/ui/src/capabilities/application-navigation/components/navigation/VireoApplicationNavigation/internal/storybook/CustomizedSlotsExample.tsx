import { HomeOutlined } from "@mui/icons-material";
import { Box, List } from "@mui/material";
import { VireoApplicationNavigation, VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ display: "flex", height: 360, overflow: "hidden" }}>
        <VireoApplicationNavigation
          mode="compact"
          resizable={false}
          slots={{ root: "aside" }}
          slotProps={{
            root: { "aria-label": "Compact application navigation" },
            content: { sx: { bgcolor: "background.default", pt: 2 } },
          }}
        >
          <List sx={{ px: 1 }}>
            <VireoApplicationNavigationItem icon={<HomeOutlined />} label="Dashboard" compactLabel="Home" selected />
          </List>
        </VireoApplicationNavigation>
        <Box sx={{ flex: 1, p: 3 }}>Custom root and content slots</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
