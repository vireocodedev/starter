import { Button } from "@mui/material";
import { VireoFormActions } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormActions>
        <Button variant="outlined">Discard changes</Button>
        <Button variant="contained">Save customer</Button>
      </VireoFormActions>
    </VireoStorybookProvider>
  );
}
