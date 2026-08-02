import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputSelect, type RgoInputSelectProps } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import { Star } from "@mui/icons-material";
import React from "react";

type Option = {
  id: number;
  name: string;
  color: string;
};

const options: Option[] = [
  { id: 1, name: "Ruby Red", color: "#dc2626" },
  { id: 2, name: "Emerald Green", color: "#059669" },
  { id: 3, name: "Sapphire Blue", color: "#2563eb" },
  { id: 4, name: "Golden Yellow", color: "#d97706" },
  { id: 5, name: "Amethyst Purple", color: "#7c3aed" },
];

type RgoInputSelectWithCustomizationDemoProps = Partial<
  Omit<RgoInputSelectProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithCustomizationDemo(
  props: RgoInputSelectWithCustomizationDemoProps = {
    rgoSlotProps: {
      root: {
        sx: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
              borderWidth: 2,
            },
          },
        },
      },
      selectItem: {
        sx: {
          "&:hover": {
            backgroundColor: "primary.50",
          },
          "&.Mui-selected": {
            backgroundColor: "primary.100",
            "&:hover": {
              backgroundColor: "primary.200",
            },
          },
        },
      },
    },
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  const renderOption = (option: Option) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: option.color,
        }}
      />
      <span>{option.name}</span>
      <Star sx={{ color: option.color, fontSize: 16, marginLeft: "auto" }} />
    </div>
  );

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={options}
        renderOption={renderOption}
        renderValue={option => option.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}

export const RgoInputSelectWithCustomizationDemoCode = `
import { RgoLabelBox, RgoInputSelect, type RgoInputSelectProps } from "@vireocodedev/starter-ui";
import { Star } from "@mui/icons-material";
import React from "react";

type Option = {
  id: number;
  name: string;
  color: string;
};

const options: Option[] = [
  { id: 1, name: "Ruby Red", color: "#dc2626" },
  { id: 2, name: "Emerald Green", color: "#059669" },
  { id: 3, name: "Sapphire Blue", color: "#2563eb" },
  { id: 4, name: "Golden Yellow", color: "#d97706" },
  { id: 5, name: "Amethyst Purple", color: "#7c3aed" },
];

type RgoInputSelectWithCustomizationDemoProps = Partial<Omit<RgoInputSelectProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">>;

export function RgoInputSelectWithCustomizationDemo(
  props: RgoInputSelectWithCustomizationDemoProps = {
    rgoSlotProps: {
      root: {
        sx: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
              borderWidth: 2,
            },
          },
        },
      },
      selectItem: {
        sx: {
          "&:hover": {
            backgroundColor: "primary.50",
          },
          "&.Mui-selected": {
            backgroundColor: "primary.100",
            "&:hover": {
              backgroundColor: "primary.200",
            },
          },
        },
      },
    },
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  const renderOption = (option: Option) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: option.color,
        }}
      />
      <span>{option.name}</span>
      <Star sx={{ color: option.color, fontSize: 16, marginLeft: "auto" }} />
    </div>
  );

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={options}
        renderOption={renderOption}
        renderValue={(option) => option.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}`;
