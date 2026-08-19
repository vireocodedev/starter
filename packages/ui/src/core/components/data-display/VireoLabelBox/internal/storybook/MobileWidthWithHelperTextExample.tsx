import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, OutlinedInput } from "@mui/material";

export default function MobileWidthWithHelperTextExample() {
  return (
    <VireoStorybookProvider>
      <Box width={360} maxWidth="100%">
        <VireoLabelBox label="Account name" helperText="Shown on customer-facing invoices">
          <OutlinedInput aria-label="Account name" placeholder="Acme Ltd." size="small" fullWidth />
        </VireoLabelBox>
      </Box>
    </VireoStorybookProvider>
  );
}
