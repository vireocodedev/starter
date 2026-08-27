import { Alert, TextField } from "@mui/material";
import { VireoFormSection, VireoFormSectionItem, VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function FullRowExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Billing details" maxColumns={2}>
        <VireoLabelBox label="Purchase order">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Purchase order" } }} />
        </VireoLabelBox>
        <VireoLabelBox label="Cost center">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Cost center" } }} />
        </VireoLabelBox>
        <VireoFormSectionItem span="full">
          <Alert severity="info">Invoices will use the billing profile selected for this customer.</Alert>
        </VireoFormSectionItem>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
