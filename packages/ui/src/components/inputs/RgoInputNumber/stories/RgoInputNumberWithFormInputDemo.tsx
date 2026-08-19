import { RgoLabelBox } from "@/core/public";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputNumber } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

const schema = () =>
  z.object({
    date: z
      .number()
      .nullable()
      .refine(value => value !== null, { message: "Field is required" }),
  });

export function RgoInputNumberWithFormInputDemo() {
  const t = useTranslationLocal();
  const form = useRgoForm({
    t,
    schema,
    defaultValues: {
      date: null,
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
                <RgoLabelBox label="Input field" required>
                  <Controller
                    name="date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RgoInputNumber {...field} error={fieldState.invalid} helperText={fieldState.error?.message} />
                    )}
                  />
                </RgoLabelBox>
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

export const RgoInputNumberWithFormInputDemoCode = `
import { 
  RgoLabelBox,
  RgoForm,
  RgoInputNumber,
  RgoFormSection,
  RgoFormSectionGrid,
  useRgoForm 
} from "@vireocodedev/starter-ui";
import { Card, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

const schema = () =>
  z.object({
    date: z
      .number()
      .nullable()
      .refine(value => value !== null, { message: "Date is required" }),
  });

export function RgoInputNumberWithFormInputDemo() {
  const form = useRgoForm({
    schema,
    defaultValues: {
      date: null,
    },
  });

  return (
    <Card sx={{ maxWidth: "50%", outline: "1px solid var(--mui-palette-warning-300)" }}>
      <CardHeader title="Demo form" />
      <RgoForm onSubmit={data => alert(JSON.stringify(data, null, 2))} form={form} hideCancelButton>
        <RgoFormSection>
          <RgoFormSectionGrid>
            <Grid size={12}>
              <RgoLabelBox label="Input field" required>
                <Controller
                  name="date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputNumber {...field} error={fieldState.invalid} helperText={fieldState.error?.message} />
                  )}
                />
              </RgoLabelBox>
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>
      </RgoForm>
    </Card>
  );
}`;
