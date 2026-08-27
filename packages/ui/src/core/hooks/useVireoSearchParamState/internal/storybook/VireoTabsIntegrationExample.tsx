import { VireoTabs, useVireoSearchParamState } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper, Typography } from "@mui/material";

const tabs = [
  { value: "profile", label: "Profile", content: <Typography>Customer profile settings</Typography> },
  { value: "security", label: "Security", content: <Typography>Password and access settings</Typography> },
  { value: "notifications", label: "Notifications", content: <Typography>Notification preferences</Typography> },
];

export default function VireoTabsIntegrationExample() {
  const [tab, setTab] = useVireoSearchParamState("vireo-hook-tab", {
    defaultValue: "profile",
  });

  return (
    <VireoStorybookProvider>
      <Paper variant="outlined" sx={{ maxWidth: 680, p: 2 }}>
        <VireoTabs tabs={tabs} value={tab} onChange={setTab} />
      </Paper>
    </VireoStorybookProvider>
  );
}
