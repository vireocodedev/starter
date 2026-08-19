import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { TextField } from "@mui/material";
import { VireoFormSection } from "@vireocodedev/starter-ui";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection
        label="Delivery address"
        slotProps={{
          root: {
            sx: { maxWidth: 560 },
          },
          label: { color: "primary.main" },
          content: { sx: { borderLeft: 4, borderLeftColor: "primary.main" } },
        }}
      >
        <TextField label="Street and number" fullWidth />
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
