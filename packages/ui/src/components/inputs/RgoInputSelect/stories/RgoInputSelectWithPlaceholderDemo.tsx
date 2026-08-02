import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputSelect, type RgoInputSelectProps } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import React from "react";

type Color = {
  id: number;
  name: string;
  hex: string;
};

const colors: Color[] = [
  { id: 1, name: "Red", hex: "#f44336" },
  { id: 2, name: "Blue", hex: "#2196f3" },
  { id: 3, name: "Green", hex: "#4caf50" },
  { id: 4, name: "Orange", hex: "#ff9800" },
  { id: 5, name: "Purple", hex: "#9c27b0" },
];

type RgoInputSelectWithPlaceholderDemoProps = Partial<
  Omit<RgoInputSelectProps<Color, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithPlaceholderDemo(props: RgoInputSelectWithPlaceholderDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={colors}
        renderOption={color => color.name}
        renderValue={color => color.id}
        value={value}
        onChange={setValue}
        placeholder="Choose your favorite color..."
      />
    </RgoLabelBox>
  );
}

export const RgoInputSelectWithPlaceholderDemoCode = `
import { RgoLabelBox, RgoInputSelect, type RgoInputSelectProps } from "@vireocodedev/starter-ui";
import React from "react";

type Color = {
  id: number;
  name: string;
  hex: string;
};

const colors: Color[] = [
  { id: 1, name: "Red", hex: "#f44336" },
  { id: 2, name: "Blue", hex: "#2196f3" },
  { id: 3, name: "Green", hex: "#4caf50" },
  { id: 4, name: "Orange", hex: "#ff9800" },
  { id: 5, name: "Purple", hex: "#9c27b0" },
];

type RgoInputSelectWithPlaceholderDemoProps = Partial<
  Omit<RgoInputSelectProps<Color, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithPlaceholderDemo(props: RgoInputSelectWithPlaceholderDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={colors}
        renderOption={color => color.name}
        renderValue={color => color.id}
        value={value}
        onChange={setValue}
        placeholder="Choose your favorite color..."
      />
    </RgoLabelBox>
  );
}`;
