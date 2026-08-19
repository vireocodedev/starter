import { RgoLabelBox } from "@/core/public";
import {
  RgoInputAutocompleteMultiple,
  type RgoInputAutocompleteMultipleProps,
} from "@/components/inputs/RgoInputAutocompleteMultiple/RgoInputAutocompleteMultiple";
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
  { id: 7, name: "Strawberry", category: "Fruit" },
  { id: 8, name: "Potato", category: "Vegetable" },
];

type RgoInputAutocompleteMultipleWithHelperTextDemoProps = Partial<
  Omit<
    RgoInputAutocompleteMultipleProps<Option>,
    "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue"
  >
>;

export function RgoInputAutocompleteMultipleWithHelperTextDemo(
  props: RgoInputAutocompleteMultipleWithHelperTextDemoProps = {},
) {
  const [value, setValue] = React.useState<Option[]>([]);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Select multiple food items">
      <RgoInputAutocompleteMultiple
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

export const RgoInputAutocompleteMultipleWithHelperTextDemoCode = `import { RgoLabelBox, RgoInputAutocompleteMultiple, type RgoInputAutocompleteMultipleProps } from "@vireocodedev/starter-ui";
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
  { id: 7, name: "Strawberry", category: "Fruit" },
  { id: 8, name: "Potato", category: "Vegetable" },
];

type RgoInputAutocompleteMultipleWithHelperTextDemoProps = Partial<Omit<RgoInputAutocompleteMultipleProps<Option>, "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue">>;

export function RgoInputAutocompleteMultipleWithHelperTextDemo(props: RgoInputAutocompleteMultipleWithHelperTextDemoProps = {}) {
  const [value, setValue] = React.useState<Option[]>([]);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Select multiple food items">
      <RgoInputAutocompleteMultiple
        {...props}
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={mockOptions}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </RgoLabelBox>
  );
}`;
