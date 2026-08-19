import { RgoLabelBox } from "@/core/public";
import { RgoInputSelect, type RgoInputSelectProps } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import React from "react";

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

type RgoInputSelectWithHelperTextDemoProps = Partial<
  Omit<RgoInputSelectProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithHelperTextDemo(
  props: RgoInputSelectWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={options}
        renderOption={option => option.name}
        renderValue={option => option.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}

export const RgoInputSelectWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputSelect, type RgoInputSelectProps } from "@vireocodedev/starter-ui";
import React from "react";

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

type RgoInputSelectWithHelperTextDemoProps = Partial<Omit<RgoInputSelectProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">>;

export function RgoInputSelectWithHelperTextDemo(
  props: RgoInputSelectWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={options}
        renderOption={(option) => option.name}
        renderValue={(option) => option.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}`;
