import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import {
  RgoInputSelectMultiple,
  type RgoInputSelectMultipleProps,
} from "@/components/inputs/RgoInputSelectMultiple/RgoInputSelectMultiple";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

type Option = {
  id: number;
  name: string;
};

const options: Option[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
  { id: 5, name: "Elderberry" },
];

type FormProps = Partial<
  Omit<RgoInputSelectMultipleProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

const schema = () =>
  z.object({
    fruits: z.array(z.number()).min(1, { message: "Please select at least one fruit" }),
  });

export function RgoInputSelectMultipleWithFormInputDemo(props: FormProps = {}) {
  const t = useTranslationLocal();
  const form = useRgoForm({
    t,
    schema,
    defaultValues: {
      fruits: [],
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
                    name="fruits"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RgoInputSelectMultiple
                        {...props}
                        {...field}
                        options={options}
                        renderOption={option => option.name}
                        renderValue={option => option.id}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                        placeholder="Choose your favorites..."
                      />
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
          <Button type="button" onClick={() => form.reset()}>
            Reset
          </Button>
        </CardActions>
      </Card>
    </RgoForm>
  );
}

export const RgoInputSelectMultipleWithFormInputDemoCode = `
import { RgoLabelBox, RgoForm, RgoInputSelectMultiple, RgoFormSection, RgoFormSectionGrid, type RgoInputSelectMultipleProps } from "@vireocodedev/starter-ui";
import { useRgoForm } from "@vireocodedev/starter-ui";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

type Option = {
  id: number;
  name: string;
};

const options: Option[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
  { id: 5, name: "Elderberry" },
];

type FormProps = Partial<Omit<RgoInputSelectMultipleProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">>;

const schema = () =>
  z.object({
    fruits: z
      .array(z.number())
      .min(1, { message: "Please select at least one fruit" }),
  });

export function RgoInputSelectMultipleWithFormInputDemo(props: FormProps = {}) {
  const form = useRgoForm({
    schema,
    defaultValues: {
      fruits: [],
    },
  });

  return (
    <RgoForm onSubmit={(data) => alert(JSON.stringify(data, null, 2))} form={form}>
      <Card sx={{ maxWidth: "50%", outline: "1px solid var(--mui-palette-info-300)" }}>
        <CardHeader title="Demo form" />
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <RgoFormSection>
            <RgoFormSectionGrid>
              <Grid size={12}>
                <RgoLabelBox label="Input field" required>
                  <Controller
                    name="fruits"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RgoInputSelectMultiple
                        {...props}
                        {...field}
                        options={options}
                        renderOption={(option) => option.name}
                        renderValue={(option) => option.id}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                        placeholder="Choose your favorites..."
                      />
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
          <Button type="button" onClick={() => form.reset()}>
            Reset
          </Button>
        </CardActions>
      </Card>
    </RgoForm>
  );
}`;
