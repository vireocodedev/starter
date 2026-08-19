import { RgoLabelBox } from "@/core/public";
import {
  RgoInputSelectMultiple,
  type RgoInputSelectMultipleProps,
} from "@/components/inputs/RgoInputSelectMultiple/RgoInputSelectMultiple";
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

type RgoInputSelectMultipleWithDisabledDemoProps = Partial<
  Omit<RgoInputSelectMultipleProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectMultipleWithDisabledDemo(props: RgoInputSelectMultipleWithDisabledDemoProps = {}) {
  const [value, setValue] = React.useState<number[]>([1, 3]);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelectMultiple
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

export const RgoInputSelectMultipleWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputSelectMultiple, type RgoInputSelectMultipleProps } from "@vireocodedev/starter-ui";
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

type RgoInputSelectMultipleWithDisabledDemoProps = Partial<Omit<RgoInputSelectMultipleProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">>;

export function RgoInputSelectMultipleWithDisabledDemo(props: RgoInputSelectMultipleWithDisabledDemoProps = {}) {
  const [value, setValue] = React.useState<number[]>([1, 3]);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelectMultiple
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
