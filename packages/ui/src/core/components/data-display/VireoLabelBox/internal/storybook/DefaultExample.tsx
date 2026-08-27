import { VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { OutlinedInput } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoLabelBox label="Account name">
        <OutlinedInput aria-label="Account name" placeholder="Acme Ltd." size="small" fullWidth />
      </VireoLabelBox>
    </VireoStorybookProvider>
  );
}
