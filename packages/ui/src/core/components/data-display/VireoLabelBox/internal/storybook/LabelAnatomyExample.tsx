import { VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { OutlinedInput } from "@mui/material";

export default function LabelAnatomyExample() {
  return (
    <VireoStorybookProvider>
      <VireoLabelBox label="Billing contact" helperText="Used on invoices" required>
        <OutlinedInput aria-label="Billing contact" placeholder="billing@example.com" size="small" fullWidth />
      </VireoLabelBox>
    </VireoStorybookProvider>
  );
}
