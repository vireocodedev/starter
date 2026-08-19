import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { OutlinedInput } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoLabelBox
        label="Account name"
        helperText="Customized anatomy"
        slots={{ root: "section", label: "strong", helperText: "small" }}
        slotProps={{
          root: {
            "aria-label": "Customized account field",
            sx: { border: 1, borderColor: "primary.main", borderRadius: 2, p: 2 },
          },
          label: { sx: { letterSpacing: "0.08em", textTransform: "uppercase" } },
          helperText: { sx: { color: "primary.light" } },
        }}
      >
        <OutlinedInput aria-label="Account name" placeholder="Acme Ltd." size="small" fullWidth />
      </VireoLabelBox>
    </VireoStorybookProvider>
  );
}
