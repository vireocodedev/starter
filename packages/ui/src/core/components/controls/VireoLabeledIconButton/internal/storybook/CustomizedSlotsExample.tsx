import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { VireoLabeledIconButton } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoLabeledIconButton
        label="Alerts"
        icon={<NotificationsRoundedIcon />}
        selected
        showStatusDot
        onClick={() => undefined}
        slotProps={{
          root: { sx: { border: 1, borderColor: "divider" } },
          statusDot: { "aria-label": "Unread alerts", sx: { bgcolor: "warning.main" } },
          label: state => ({ "data-selected": String(state.selected) }),
        }}
      />
    </VireoStorybookProvider>
  );
}
