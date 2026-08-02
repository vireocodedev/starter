import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputSwitch } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

const schema = () =>
  z.object({
    toggle: z
      .boolean()
      .nullable()
      .refine(value => value === true, { message: "You must agree to continue" }),
  });

export function RgoInputSwitchWithFormInputDemo() {
  const t = useTranslationLocal();
  const form = useRgoForm({
    t,
    schema,
    defaultValues: {
      toggle: null,
    },
  });

  return (
    <RgoForm onSubmit={data => alert(JSON.stringify(data, null, 2))} form={form}>
      <Card sx={{ maxWidth: "50%", outline: "1px solid var(--mui-palette-info-300)" }}>
        <CardHeader title="Demo form" />
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <RgoFormSection>
            <RgoFormSectionGrid>
              <Grid size={12}>
                <Controller
                  name="toggle"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputSwitch
                      {...field}
                      label="I agree to the terms and conditions"
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </RgoFormSectionGrid>
          </RgoFormSection>
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" type="submit">
            Submit
          </Button>
        </CardActions>
      </Card>
    </RgoForm>
  );
}

export const RgoInputSwitchWithFormInputDemoCode = `
import { 
  RgoForm,
  RgoInputSwitch,
  RgoFormSection,
  RgoFormSectionGrid,
  useRgoForm 
} from "@vireocodedev/starter-ui";
import { Card, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

const schema = () =>
  z.object({
    toggle: z
      .boolean()
      .nullable()
      .refine(value => value === true, { message: "You must agree to continue" }),
  });

export function RgoInputSwitchWithFormInputDemo() {
  const form = useRgoForm({
    schema,
    defaultValues: {
      toggle: null,
    },
  });

  return (
    <Card sx={{ maxWidth: "50%", outline: "1px solid var(--mui-palette-warning-300)" }}>
      <CardHeader title="Demo form" />
      <RgoForm onSubmit={data => alert(JSON.stringify(data, null, 2))} form={form} hideCancelButton>
        <RgoFormSection>
          <RgoFormSectionGrid>
            <Grid size={12}>
              <Controller
                name="toggle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoInputSwitch 
                    {...field} 
                    label="I agree to the terms and conditions"
                    error={fieldState.invalid} 
                    helperText={fieldState.error?.message} 
                  />
                )}
              />
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>
      </RgoForm>
    </Card>
  );
}`;
