import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, TextField } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/starter-ui";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Billing details">
        <Stack spacing={2}>
          <VireoLabelBox label="Company name">
            <TextField slotProps={{ htmlInput: { "aria-label": "Company name" } }} />
          </VireoLabelBox>
          <VireoLabelBox label="Tax ID">
            <TextField slotProps={{ htmlInput: { "aria-label": "Tax ID" } }} />
          </VireoLabelBox>
        </Stack>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
