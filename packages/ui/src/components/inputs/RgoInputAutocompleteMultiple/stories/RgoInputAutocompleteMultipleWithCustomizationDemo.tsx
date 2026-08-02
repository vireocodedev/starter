import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import {
  RgoInputAutocompleteMultiple,
  type RgoInputAutocompleteMultipleProps,
} from "@/components/inputs/RgoInputAutocompleteMultiple/RgoInputAutocompleteMultiple";
import { Avatar, Chip } from "@mui/material";
import React from "react";

type Option = {
  id: number;
  name: string;
  category: string;
  emoji: string;
};

const mockOptions: Option[] = [
  { id: 1, name: "Apple", category: "Fruit", emoji: "🍎" },
  { id: 2, name: "Banana", category: "Fruit", emoji: "🍌" },
  { id: 3, name: "Orange", category: "Fruit", emoji: "🍊" },
  { id: 4, name: "Carrot", category: "Vegetable", emoji: "🥕" },
  { id: 5, name: "Broccoli", category: "Vegetable", emoji: "🥦" },
  { id: 6, name: "Spinach", category: "Vegetable", emoji: "🥬" },
  { id: 7, name: "Strawberry", category: "Fruit", emoji: "🍓" },
  { id: 8, name: "Potato", category: "Vegetable", emoji: "🥔" },
];

type RgoInputAutocompleteMultipleWithCustomizationDemoProps = Partial<
  Omit<
    RgoInputAutocompleteMultipleProps<Option>,
    | "value"
    | "onChange"
    | "searchText"
    | "onSearchTextChange"
    | "options"
    | "getOptionLabel"
    | "isOptionEqualToValue"
    | "renderOption"
  >
>;

export function RgoInputAutocompleteMultipleWithCustomizationDemo(
  props: RgoInputAutocompleteMultipleWithCustomizationDemoProps = {},
) {
  const [value, setValue] = React.useState<Option[]>([]);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Select multiple food items with custom rendering">
      <RgoInputAutocompleteMultiple
        {...props}
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={mockOptions}
        getOptionLabel={option => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(props, option) => (
          <li {...props} key={option.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: "12px" }}>{option.emoji}</Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{option.name}</div>
              <div style={{ fontSize: "0.875rem", color: "text.secondary" }}>{option.category}</div>
            </div>
          </li>
        )}
        rgoSlotProps={{
          root: {
            renderTags: (value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  variant="outlined"
                  label={option.name}
                  avatar={<Avatar sx={{ width: 20, height: 20, fontSize: "10px" }}>{option.emoji}</Avatar>}
                  size="small"
                />
              )),
          },
        }}
      />
    </RgoLabelBox>
  );
}

export const RgoInputAutocompleteMultipleWithCustomizationDemoCode = `import { RgoLabelBox, RgoInputAutocompleteMultiple, type RgoInputAutocompleteMultipleProps } from "@vireocodedev/starter-ui";
import { Chip, Avatar } from "@mui/material";
import React from "react";

type Option = {
  id: number;
  name: string;
  category: string;
  emoji: string;
};

const mockOptions: Option[] = [
  { id: 1, name: "Apple", category: "Fruit", emoji: "🍎" },
  { id: 2, name: "Banana", category: "Fruit", emoji: "🍌" },
  { id: 3, name: "Orange", category: "Fruit", emoji: "🍊" },
  { id: 4, name: "Carrot", category: "Vegetable", emoji: "🥕" },
  { id: 5, name: "Broccoli", category: "Vegetable", emoji: "🥦" },
  { id: 6, name: "Spinach", category: "Vegetable", emoji: "🥬" },
  { id: 7, name: "Strawberry", category: "Fruit", emoji: "🍓" },
  { id: 8, name: "Potato", category: "Vegetable", emoji: "🥔" },
];

type RgoInputAutocompleteMultipleWithCustomizationDemoProps = Partial<Omit<RgoInputAutocompleteMultipleProps<Option>, "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue" | "renderOption">>;

export function RgoInputAutocompleteMultipleWithCustomizationDemo(props: RgoInputAutocompleteMultipleWithCustomizationDemoProps = {}) {
  const [value, setValue] = React.useState<Option[]>([]);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Select multiple food items with custom rendering">
      <RgoInputAutocompleteMultiple
        {...props}
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={mockOptions}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(props, option) => (
          <li {...props} key={option.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: "12px" }}>{option.emoji}</Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{option.name}</div>
              <div style={{ fontSize: "0.875rem", color: "text.secondary" }}>{option.category}</div>
            </div>
          </li>
        )}
        rgoSlotProps={{
          root: {
            renderTags: (value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  variant="outlined"
                  label={option.name}
                  avatar={<Avatar sx={{ width: 20, height: 20, fontSize: "10px" }}>{option.emoji}</Avatar>}
                  size="small"
                />
              )),
          },
        }}
      />
    </RgoLabelBox>
  );
}`;
