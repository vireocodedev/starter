import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { VireoStatusDot } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function SelectedSurfaceExample() {
  return (
    <VireoStorybookProvider>
      <List disablePadding sx={{ maxWidth: 360 }}>
        <ListItemButton selected sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <VireoStatusDot color="success" selected />
          </ListItemIcon>
          <ListItemText primary="Production" secondary="Selected environment · Operational" />
        </ListItemButton>
      </List>
    </VireoStorybookProvider>
  );
}
