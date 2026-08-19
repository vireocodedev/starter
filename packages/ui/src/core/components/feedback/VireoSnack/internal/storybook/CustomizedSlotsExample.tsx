import { Button, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { VireoSnack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoSnack
        variant="warning"
        message="Connection is unstable"
        startAdornment={<WarningAmberRoundedIcon fontSize="small" />}
        endAdornment={
          <Button color="inherit" size="small">
            Reconnect
          </Button>
        }
        slots={{ message: Typography }}
        slotProps={{
          root: state => ({ "data-severity": state.variant, sx: { maxWidth: 420 } }),
          message: { fontWeight: 600 },
        }}
      />
    </VireoStorybookProvider>
  );
}
