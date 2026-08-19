import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { VireoSnack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoSnack
        variant="success"
        message="Changes saved"
        startAdornment={<CheckCircleRoundedIcon fontSize="small" />}
      />
    </VireoStorybookProvider>
  );
}
