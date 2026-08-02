import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { TextField } from "@mui/material";

export function RgoFormSectionWithDefaultPropsDemo() {
  return (
    <RgoFormSection>
      <TextField label="First name" placeholder="Enter first name" fullWidth />
      <TextField label="Last name" placeholder="Enter last name" fullWidth />
      <TextField label="Email" placeholder="Enter email" fullWidth />
    </RgoFormSection>
  );
}

export const RgoFormSectionWithDefaultPropsDemoCode = `
import { RgoFormSection } from "@vireocodedev/starter-ui";
import { TextField } from "@mui/material";

export function RgoFormSectionWithDefaultPropsDemo() {
  return (
    <RgoFormSection>
      <TextField label="First name" placeholder="Enter first name" fullWidth />
      <TextField label="Last name" placeholder="Enter last name" fullWidth />
      <TextField label="Email" placeholder="Enter email" fullWidth />
    </RgoFormSection>
  );
}`;
