import { RgoLabelBox } from "@/core/public";
import {
  RgoInputAutocompleteMultiple,
  type RgoInputAutocompleteMultipleProps,
} from "@/components/inputs/RgoInputAutocompleteMultiple/RgoInputAutocompleteMultiple";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Stack } from "@mui/material";
import React from "react";
import { Controller, type ControllerFieldState, type ControllerRenderProps } from "react-hook-form";
import z from "zod";

type Option = {
  id: number;
  name: string;
  category: string;
};

const mockOptions: Option[] = [
  { id: 1, name: "Apple", category: "Fruit" },
  { id: 2, name: "Banana", category: "Fruit" },
  { id: 3, name: "Orange", category: "Fruit" },
  { id: 4, name: "Carrot", category: "Vegetable" },
  { id: 5, name: "Broccoli", category: "Vegetable" },
  { id: 6, name: "Spinach", category: "Vegetable" },
  { id: 7, name: "Strawberry", category: "Fruit" },
  { id: 8, name: "Potato", category: "Vegetable" },
];

const formSchema = () =>
  z.object({
    selectedItems: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
          category: z.string(),
        }),
      )
      .min(1, "Please select at least one item")
      .max(4, "Please select at most 4 items"),
  });

type FormData = z.infer<ReturnType<typeof formSchema>>;

// Helper component to handle the autocomplete field with proper hook usage
function AutocompleteMultipleField({
  field,
  fieldState,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  ...props
}: {
  field: ControllerRenderProps<FormData, "selectedItems">;
  fieldState: ControllerFieldState;
  options: Option[];
  getOptionLabel: (option: Option) => string;
  isOptionEqualToValue: (option: Option, value: Option) => boolean;
} & Partial<RgoInputAutocompleteMultipleProps<Option>>) {
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoInputAutocompleteMultiple
      {...props}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
}

export function RgoInputAutocompleteMultipleWithFormInputDemo() {
  const t = useTranslationLocal();
  const form = useRgoForm<FormData>({
    t,
    schema: formSchema,
    defaultValues: {
      selectedItems: [],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert(`Selected items: ${data.selectedItems.map(item => item.name).join(", ")}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Controller
          name="selectedItems"
          control={form.control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Select your favorite foods (1-4 items)" required>
              <AutocompleteMultipleField
                field={field}
                fieldState={fieldState}
                options={mockOptions}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </RgoLabelBox>
          )}
        />

        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button type="button" variant="outlined" onClick={() => form.reset()}>
            Reset
          </Button>
        </Stack>

        <div>
          <strong>Form State:</strong>
          <pre style={{ fontSize: "0.875rem", marginTop: "8px" }}>{JSON.stringify(form.watch(), null, 2)}</pre>
        </div>
      </Stack>
    </form>
  );
}

export const RgoInputAutocompleteMultipleWithFormInputDemoCode = `import { RgoLabelBox, RgoInputAutocompleteMultiple, type RgoInputAutocompleteMultipleProps } from "@vireocodedev/starter-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import React from "react";
import { Controller, useRgoForm, type ControllerRenderProps, type ControllerFieldState } from "react-hook-form";
import z from "zod";

type Option = {
  id: number;
  name: string;
  category: string;
};

const mockOptions: Option[] = [
  { id: 1, name: "Apple", category: "Fruit" },
  { id: 2, name: "Banana", category: "Fruit" },
  { id: 3, name: "Orange", category: "Fruit" },
  { id: 4, name: "Carrot", category: "Vegetable" },
  { id: 5, name: "Broccoli", category: "Vegetable" },
  { id: 6, name: "Spinach", category: "Vegetable" },
  { id: 7, name: "Strawberry", category: "Fruit" },
  { id: 8, name: "Potato", category: "Vegetable" },
];

const formSchema = z.object({
  selectedItems: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        category: z.string(),
      })
    )
    .min(1, "Please select at least one item")
    .max(4, "Please select at most 4 items"),
});

type FormData = z.infer<typeof formSchema>;

// Helper component to handle the autocomplete field with proper hook usage
function AutocompleteMultipleField({
  field,
  fieldState,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  ...props
}: {
  field: ControllerRenderProps<FormData, "selectedItems">;
  fieldState: ControllerFieldState;
  options: Option[];
  getOptionLabel: (option: Option) => string;
  isOptionEqualToValue: (option: Option, value: Option) => boolean;
} & Partial<RgoInputAutocompleteMultipleProps<Option>>) {
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoInputAutocompleteMultiple
      {...props}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
}

export function RgoInputAutocompleteMultipleWithFormInputDemo() {
  const form = useRgoForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedItems: [],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert(\`Selected items: \${data.selectedItems.map((item) => item.name).join(", ")}\`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Controller
          name="selectedItems"
          control={form.control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Select your favorite foods (1-4 items)" required>
              <AutocompleteMultipleField
                field={field}
                fieldState={fieldState}
                options={mockOptions}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </RgoLabelBox>
          )}
        />

        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button type="button" variant="outlined" onClick={() => form.reset()}>
            Reset
          </Button>
        </Stack>

        <div>
          <strong>Form State:</strong>
          <pre style={{ fontSize: "0.875rem", marginTop: "8px" }}>
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </div>
      </Stack>
    </form>
  );
}`;
