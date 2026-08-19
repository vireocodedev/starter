import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { OutlinedInput } from "@mui/material";

export default function WithHelperTextExample() {
  return (
    <VireoStorybookProvider>
      <VireoLabelBox label="Account name" helperText="Shown on customer-facing invoices">
        <OutlinedInput aria-label="Account name" placeholder="Acme Ltd." size="small" fullWidth />
      </VireoLabelBox>
    </VireoStorybookProvider>
  );
}
