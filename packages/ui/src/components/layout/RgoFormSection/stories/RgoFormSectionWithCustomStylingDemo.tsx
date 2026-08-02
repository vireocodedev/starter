import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { TextField } from "@mui/material";

export function RgoFormSectionWithCustomStylingDemo() {
  return (
    <RgoFormSection
      label="Custom Styled Section"
      rgoSlotProps={{
        root: {
          sx: { gap: 3 },
        },
        label: {
          sx: { color: "primary.main", fontStyle: "italic" },
        },
        content: {
          sx: { p: 4, gap: 2, borderColor: "primary.main" },
        },
      }}
    >
      <TextField label="Field 1" placeholder="Custom padding and gap" fullWidth />
      <TextField label="Field 2" placeholder="Custom border color" fullWidth />
    </RgoFormSection>
  );
}

export const RgoFormSectionWithCustomStylingDemoCode = `
import { RgoFormSection } from "@vireocodedev/starter-ui";
import { TextField } from "@mui/material";

export function RgoFormSectionWithCustomStylingDemo() {
  return (
    <RgoFormSection
      label="Custom Styled Section"
      rgoSlotProps={{
        root: {
          sx: { gap: 3 },
        },
        label: {
          sx: { color: "primary.main", fontStyle: "italic" },
        },
        content: {
          sx: { p: 4, gap: 2, borderColor: "primary.main" },
        },
      }}
    >
      <TextField label="Field 1" placeholder="Custom padding and gap" fullWidth />
      <TextField label="Field 2" placeholder="Custom border color" fullWidth />
    </RgoFormSection>
  );
}`;
