import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import {
  RgoInputToggleButtonGroup,
  type RgoInputToggleButtonGroupProps,
} from "@/components/inputs/RgoInputToggleButtonGroup/RgoInputToggleButtonGroup";
import React from "react";

const OPTIONS = ["Red", "Green", "Blue"];

type DemoProps = Partial<
  Omit<
    RgoInputToggleButtonGroupProps<string>,
    "value" | "onChange" | "options" | "renderOption" | "renderKey" | "multiple"
  >
>;

export function RgoInputToggleButtonGroupWithMultipleDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <RgoLabelBox label="Colors">
      <RgoInputToggleButtonGroup
        {...props}
        multiple
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}

export const RgoInputToggleButtonGroupWithMultipleDemoCode = `
import { RgoLabelBox, RgoInputToggleButtonGroup, type RgoInputToggleButtonGroupProps } from "@vireocodedev/starter-ui";
import React from "react";

const OPTIONS = ["Red", "Green", "Blue"];

type DemoProps = Partial<
  Omit<RgoInputToggleButtonGroupProps<string>, "value" | "onChange" | "options" | "renderOption" | "renderKey" | "multiple">
>;

export function RgoInputToggleButtonGroupWithMultipleDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <RgoLabelBox label="Colors">
      <RgoInputToggleButtonGroup
        {...props}
        multiple
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}`;
