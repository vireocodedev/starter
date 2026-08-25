import { TextField } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function OutlinedExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection
        label="Independent approval"
        description="Outlined sections are reserved for subgroups that need their own visual boundary."
        variant="outlined"
      >
        <VireoLabelBox label="Approver">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Approver" } }} />
        </VireoLabelBox>
        <VireoLabelBox label="Reference">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Reference" } }} />
        </VireoLabelBox>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
