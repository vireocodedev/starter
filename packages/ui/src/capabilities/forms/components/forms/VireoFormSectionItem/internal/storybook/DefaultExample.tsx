import { Alert, TextField } from "@mui/material";
import { VireoFormSection, VireoFormSectionItem, VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Billing details" maxColumns={2}>
        <VireoLabelBox label="Purchase order">
          <TextField aria-label="Purchase order" fullWidth />
        </VireoLabelBox>
        <VireoLabelBox label="Cost center">
          <TextField aria-label="Cost center" fullWidth />
        </VireoLabelBox>
        <VireoFormSectionItem span="full">
          <Alert severity="info">Invoices will use the billing profile selected for this customer.</Alert>
        </VireoFormSectionItem>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
