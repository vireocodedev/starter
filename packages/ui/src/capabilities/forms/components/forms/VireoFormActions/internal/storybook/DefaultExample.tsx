import { Button } from "@mui/material";
import { VireoFormActions } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

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
