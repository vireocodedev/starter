import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputSelect, type RgoInputSelectProps } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import React from "react";

type Option = {
  id: number;
  name: string;
};

const options: Option[] = [
  { id: 1, name: "Option 1" },
  { id: 2, name: "Option 2" },
  { id: 3, name: "Option 3" },
  { id: 4, name: "Option 4" },
  { id: 5, name: "Option 5" },
];

type RgoInputSelectWithNoClearDemoProps = Partial<
  Omit<RgoInputSelectProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithNoClearDemo(props: RgoInputSelectWithNoClearDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(2); // Pre-select an option to show the difference

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={options}
        renderOption={option => option.name}
        renderValue={option => option.id}
        value={value}
        onChange={setValue}
        disableClearable={true}
      />
    </RgoLabelBox>
  );
}

export const RgoInputSelectWithNoClearDemoCode = `
import { RgoLabelBox, RgoInputSelect, type RgoInputSelectProps } from "@vireocodedev/starter-ui";
import React from "react";

type Option = {
  id: number;
  name: string;
};

const options: Option[] = [
  { id: 1, name: "Option 1" },
  { id: 2, name: "Option 2" },
  { id: 3, name: "Option 3" },
  { id: 4, name: "Option 4" },
  { id: 5, name: "Option 5" },
];

type RgoInputSelectWithNoClearDemoProps = Partial<
  Omit<RgoInputSelectProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithNoClearDemo(props: RgoInputSelectWithNoClearDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(2);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={options}
        renderOption={option => option.name}
        renderValue={option => option.id}
        value={value}
        onChange={setValue}
        disableClearable={true}
      />
    </RgoLabelBox>
  );
}`;
