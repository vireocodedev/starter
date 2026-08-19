import { RgoLabelBox } from "@/core/public";
import {
  RgoInputAutocomplete,
  type RgoInputAutocompleteProps,
} from "@/components/inputs/RgoInputAutocomplete/RgoInputAutocomplete";
import React from "react";

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
];

type RgoInputAutocompleteWithHelperTextDemoProps = Partial<
  Omit<
    RgoInputAutocompleteProps<Option>,
    "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue"
  >
>;

export function RgoInputAutocompleteWithHelperTextDemo(props: RgoInputAutocompleteWithHelperTextDemoProps = {}) {
  const [value, setValue] = React.useState<Option | null>(null);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Select a food item">
      <RgoInputAutocomplete
        {...props}
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={mockOptions}
        getOptionLabel={option => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </RgoLabelBox>
  );
}

export const RgoInputAutocompleteWithHelperTextDemoCode = `import { RgoLabelBox, RgoInputAutocomplete } from "@vireocodedev/starter-ui";
import React from "react";

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
];

export function MyComponent() {
  const [value, setValue] = React.useState<Option | null>(null);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Select a food item">
      <RgoInputAutocomplete
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={mockOptions}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        helperText="Your helpful text goes here"
      />
    </RgoLabelBox>
  );
}`;
