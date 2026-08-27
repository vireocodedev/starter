import { TextField } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function PlainStackExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Delivery address" layout="stack" variant="plain">
        <VireoLabelBox label="Street">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Street" } }} />
        </VireoLabelBox>
        <VireoLabelBox label="City">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "City" } }} />
        </VireoLabelBox>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
