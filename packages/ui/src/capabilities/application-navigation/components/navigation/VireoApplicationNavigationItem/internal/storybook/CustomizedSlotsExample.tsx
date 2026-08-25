import { SettingsOutlined } from "@mui/icons-material";
import { VireoApplicationNavigationItem } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoApplicationNavigationItem
        icon={<SettingsOutlined />}
        label="Application settings"
        compactLabel="Settings"
        mode="compact"
        slotProps={{
          root: { "data-analytics": "settings", sx: { width: 80 } },
          icon: { sx: { color: "warning.main" } },
        }}
      />
    </VireoStorybookProvider>
  );
}
