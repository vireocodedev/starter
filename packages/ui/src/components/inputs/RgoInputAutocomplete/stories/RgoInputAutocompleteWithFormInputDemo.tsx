import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import {
  RgoInputAutocomplete,
  type RgoInputAutocompleteProps,
} from "@/components/inputs/RgoInputAutocomplete/RgoInputAutocomplete";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import React from "react";
import { Controller, type ControllerFieldState, type ControllerRenderProps } from "react-hook-form";
import z from "zod";

type Option = {
  id: number;
  name: string;
  category: string;
};

const options: Option[] = [
  { id: 1, name: "Apple", category: "Fruit" },
  { id: 2, name: "Banana", category: "Fruit" },
  { id: 3, name: "Orange", category: "Fruit" },
  { id: 4, name: "Carrot", category: "Vegetable" },
  { id: 5, name: "Broccoli", category: "Vegetable" },
  { id: 6, name: "Spinach", category: "Vegetable" },
];

type FormData = {
  food: Option | null;
};

type FormProps = Partial<
  Omit<
    RgoInputAutocompleteProps<Option>,
    "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue"
  >
>;

const schema = () =>
  z.object({
    food: z
      .object({
        id: z.number(),
        name: z.string(),
        category: z.string(),
      })
      .nullable()
      .refine(value => value !== null, { message: "Please select a food item" }),
  });

export function RgoInputAutocompleteWithFormInputDemo(props: FormProps = {}) {
  const t = useTranslationLocal();
  const form = useRgoForm({
    t,
    schema,
    defaultValues: {
      food: null,
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
                <RgoLabelBox label="Food selection" required>
                  <Controller
                    name="food"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <AutocompleteField {...props} field={field} fieldState={fieldState} />
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

function AutocompleteField({
  field,
  fieldState,
  ...props
}: FormProps & {
  field: ControllerRenderProps<FormData, "food">;
  fieldState: ControllerFieldState;
}) {
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoInputAutocomplete
      {...field}
      {...props}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      options={options}
      getOptionLabel={option => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      error={fieldState.invalid}
      helperText={fieldState.error?.message}
    />
  );
}

export const RgoInputAutocompleteWithFormInputDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { 
  RgoForm,
  RgoInputAutocomplete,
  type RgoInputAutocompleteProps,
  RgoFormSection,
  RgoFormSectionGrid,
  useRgoForm,
} from "@vireocodedev/starter-ui";
import { Button, Card, CardActions, CardContent, CardHeader, Grid2 as Grid } from "@mui/material";
import React from "react";
import { Controller, type ControllerFieldState, type ControllerRenderProps } from "react-hook-form";
import z from "zod";

type Option = {
  id: number;
  name: string;
  category: string;
};

const options: Option[] = [
  { id: 1, name: "Apple", category: "Fruit" },
  { id: 2, name: "Banana", category: "Fruit" },
  { id: 3, name: "Orange", category: "Fruit" },
  { id: 4, name: "Carrot", category: "Vegetable" },
  { id: 5, name: "Broccoli", category: "Vegetable" },
  { id: 6, name: "Spinach", category: "Vegetable" },
];

type FormData = {
  food: Option | null;
};

type FormProps = Partial<
  Omit<
    RgoInputAutocompleteProps<Option>,
    "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue"
  >
>;

const schema = () =>
  z.object({
    food: z
      .object({
        id: z.number(),
        name: z.string(),
        category: z.string(),
      })
      .nullable()
      .refine(value => value !== null, { message: "Please select a food item" }),
  });

export function RgoInputAutocompleteWithFormInputDemo(props: FormProps = {}) {
  const form = useRgoForm({
    schema,
    defaultValues: {
      food: null,
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
                <RgoLabelBox label="Food selection" required>
                  <Controller
                    name="food"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <AutocompleteField {...props} field={field} fieldState={fieldState} />
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

function AutocompleteField({
  field,
  fieldState,
  ...props
}: FormProps & {
  field: ControllerRenderProps<FormData, "food">;
  fieldState: ControllerFieldState;
}) {
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoInputAutocomplete
      {...field}
      {...props}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      options={options}
      getOptionLabel={option => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      error={fieldState.invalid}
      helperText={fieldState.error?.message}
    />
  );
}`;
