import { Stack, TextField, Typography } from "@mui/material";
import { VireoFormSection, VireoFormSectionItem, VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Shipping details" maxColumns={2}>
        <VireoFormSectionItem>
          <Stack spacing={1}>
            <VireoLabelBox label="Delivery instructions">
              <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Delivery instructions" } }} />
            </VireoLabelBox>
            <Typography color="text.secondary" variant="caption">
              Gate codes and arrival notes stay grouped in this one grid cell.
            </Typography>
          </Stack>
        </VireoFormSectionItem>
        <VireoLabelBox label="Contact phone">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Contact phone" } }} />
        </VireoLabelBox>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
