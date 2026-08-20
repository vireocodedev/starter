import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { TextField } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/starter-ui";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection
        label="Delivery address"
        description="The address used by the selected delivery method."
        slotProps={{
          root: {
            sx: { maxWidth: 560 },
          },
          header: { sx: { borderInlineStart: 3, borderColor: "primary.main", pl: 2 } },
          label: { color: "primary.main" },
          description: { sx: { fontStyle: "italic" } },
          content: { sx: { borderLeft: 4, borderLeftColor: "primary.main" } },
          layout: ownerState => ({ "data-columns": ownerState.maxColumns }),
        }}
      >
        <VireoLabelBox label="Street and number">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "Street and number" } }} />
        </VireoLabelBox>
        <VireoLabelBox label="City">
          <TextField fullWidth slotProps={{ htmlInput: { "aria-label": "City" } }} />
        </VireoLabelBox>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
