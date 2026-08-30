import { VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { OutlinedInput } from "@mui/material";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoLabelBox label="Account name">
        {({ controlProps }) => <OutlinedInput {...controlProps} placeholder="Acme Ltd." size="small" fullWidth />}
      </VireoLabelBox>
    </VireoStorybookProvider>
  );
}
