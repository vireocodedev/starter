import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, TextField } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/starter-ui";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={3}>
        <VireoFormSection label="Billing details" description="Information printed on invoices and tax documents.">
          <VireoLabelBox label="Company name">
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Company name" } }} />
          </VireoLabelBox>
          <VireoLabelBox label="Tax ID">
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Tax ID" } }} />
          </VireoLabelBox>
        </VireoFormSection>
        <VireoFormSection label="Delivery" description="The second section receives the shared divider treatment.">
          <VireoLabelBox label="Street">
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Street" } }} />
          </VireoLabelBox>
          <VireoLabelBox label="City">
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "City" } }} />
          </VireoLabelBox>
        </VireoFormSection>
      </Stack>
    </VireoStorybookProvider>
  );
}
