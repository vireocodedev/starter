import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { Grid2 as Grid, TextField } from "@mui/material";

export function RgoFormSectionGridWithDefaultPropsDemo() {
  return (
    <RgoFormSectionGrid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="First name" placeholder="Enter first name" fullWidth />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="Last name" placeholder="Enter last name" fullWidth />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField label="Email" placeholder="Enter email" fullWidth />
      </Grid>
    </RgoFormSectionGrid>
  );
}

export const RgoFormSectionGridWithDefaultPropsDemoCode = `
import { RgoFormSectionGrid } from "@vireocodedev/starter-ui";
import { TextField, Grid2 as Grid } from "@mui/material";

export function RgoFormSectionGridWithDefaultPropsDemo() {
  return (
    <RgoFormSectionGrid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="First name" placeholder="Enter first name" fullWidth />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField label="Last name" placeholder="Enter last name" fullWidth />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField label="Email" placeholder="Enter email" fullWidth />
      </Grid>
    </RgoFormSectionGrid>
  );
}`;
