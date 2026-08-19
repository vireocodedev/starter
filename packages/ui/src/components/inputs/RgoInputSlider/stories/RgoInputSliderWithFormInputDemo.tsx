import { RgoLabelBox } from "@/core/public";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputSlider, type RgoInputSliderProps } from "@/components/inputs/RgoInputSlider/RgoInputSlider";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

type FormProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

const schema = () =>
  z.object({
    volume: z.number().min(0, "Volume cannot be negative").max(100, "Volume cannot exceed 100"),
  });

export function RgoInputSliderWithFormInputDemo(props: FormProps = {}) {
  const t = useTranslationLocal();
  const form = useRgoForm({
    t,
    schema,
    defaultValues: {
      volume: 50,
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
                    name="volume"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RgoInputSlider
                        {...props}
                        {...field}
                        min={0}
                        max={100}
                        step={1}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </RgoLabelBox>
              </Grid>
            </RgoFormSectionGrid>
          </RgoFormSection>
        </CardContent>
        <CardActions>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button type="button" onClick={() => form.reset()}>
            Reset
          </Button>
        </CardActions>
      </Card>
    </RgoForm>
  );
}

export const RgoInputSliderWithFormInputDemoCode = `
import { RgoLabelBox, RgoForm, RgoInputSlider, RgoFormSection, RgoFormSectionGrid, type RgoInputSliderProps } from "@vireocodedev/starter-ui";
import { useRgoForm } from "@vireocodedev/starter-ui";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

type FormProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

const schema = () =>
  z.object({
    volume: z.number().min(0, "Volume cannot be negative").max(100, "Volume cannot exceed 100"),
  });

export function RgoInputSliderWithFormInputDemo(props: FormProps = {}) {
  const form = useRgoForm({
    schema,
    defaultValues: {
      volume: 50,
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
                    name="volume"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RgoInputSlider
                        {...props}
                        {...field}
                        min={0}
                        max={100}
                        step={1}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </RgoLabelBox>
              </Grid>
            </RgoFormSectionGrid>
          </RgoFormSection>
        </CardContent>
        <CardActions>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button type="button" onClick={() => form.reset()}>
            Reset
          </Button>
        </CardActions>
      </Card>
    </RgoForm>
  );
}`;
