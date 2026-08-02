import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import {
  RgoInputAutocomplete,
  type RgoInputAutocompleteProps,
} from "@/components/inputs/RgoInputAutocomplete/RgoInputAutocomplete";
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

type Option = {
  id: number;
  name: string;
  category: string;
  avatar: string;
};

const mockOptions: Option[] = [
  { id: 1, name: "Apple", category: "Fruit", avatar: "🍎" },
  { id: 2, name: "Banana", category: "Fruit", avatar: "🍌" },
  { id: 3, name: "Orange", category: "Fruit", avatar: "🍊" },
  { id: 4, name: "Carrot", category: "Vegetable", avatar: "🥕" },
  { id: 5, name: "Broccoli", category: "Vegetable", avatar: "🥦" },
  { id: 6, name: "Spinach", category: "Vegetable", avatar: "🥬" },
];

type RgoInputAutocompleteWithCustomizationDemoProps = Partial<
  Omit<
    RgoInputAutocompleteProps<Option>,
    "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue"
  >
>;

export function RgoInputAutocompleteWithCustomizationDemo(props: RgoInputAutocompleteWithCustomizationDemoProps = {}) {
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
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: "12px" }}>{option.avatar}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.category}
              </Typography>
            </Box>
          </Box>
        )}
        startAdornment={
          value ? <Avatar sx={{ width: 20, height: 20, fontSize: "10px", mr: 1 }}>{value.avatar}</Avatar> : null
        }
        rgoSlotProps={{
          root: {
            sx: {
              "& .MuiAutocomplete-popupIndicator": {
                color: "primary.main",
              },
            },
          },
          textField: {
            variant: "outlined",
            sx: {
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            },
          },
        }}
      />
    </RgoLabelBox>
  );
}

export const RgoInputAutocompleteWithCustomizationDemoCode = `import { RgoLabelBox, RgoInputAutocomplete } from "@vireocodedev/starter-ui";
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

type Option = {
  id: number;
  name: string;
  category: string;
  avatar: string;
};

const mockOptions: Option[] = [
  { id: 1, name: "Apple", category: "Fruit", avatar: "🍎" },
  { id: 2, name: "Banana", category: "Fruit", avatar: "🍌" },
  { id: 3, name: "Orange", category: "Fruit", avatar: "🍊" },
  { id: 4, name: "Carrot", category: "Vegetable", avatar: "🥕" },
  { id: 5, name: "Broccoli", category: "Vegetable", avatar: "🥦" },
  { id: 6, name: "Spinach", category: "Vegetable", avatar: "🥬" },
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
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: "12px" }}>{option.avatar}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.category}
              </Typography>
            </Box>
          </Box>
        )}
        startAdornment={
          value ? (
            <Avatar sx={{ width: 20, height: 20, fontSize: "10px", mr: 1 }}>{value.avatar}</Avatar>
          ) : null
        }
        rgoSlotProps={{
          root: {
            sx: {
              "& .MuiAutocomplete-popupIndicator": {
                color: "primary.main",
              },
            },
          },
          textField: {
            variant: "outlined",
            sx: {
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            },
          },
        }}
      />
    </RgoLabelBox>
  );
}`;
