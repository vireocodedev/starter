import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { TextField } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/starter-ui";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Billing details" description="Information printed on invoices and tax documents.">
        <VireoLabelBox label="Company name">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Company name" } }} />
        </VireoLabelBox>
        <VireoLabelBox label="Tax ID">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Tax ID" } }} />
        </VireoLabelBox>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
