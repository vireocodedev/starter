import { RgoLabelBox } from "@/core/public";
import {
  RgoInputToggleButtonGroup,
  type RgoInputToggleButtonGroupProps,
} from "@/components/inputs/RgoInputToggleButtonGroup/RgoInputToggleButtonGroup";
import React from "react";

const OPTIONS = ["Small", "Medium", "Large"];

type DemoProps = Partial<
  Omit<
    RgoInputToggleButtonGroupProps<string>,
    "value" | "onChange" | "options" | "renderOption" | "renderKey" | "multiple"
  >
>;

export function RgoInputToggleButtonGroupWithErrorDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Size">
      <RgoInputToggleButtonGroup
        {...props}
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
        error
        helperText="Size selection is required"
      />
    </RgoLabelBox>
  );
}

export const RgoInputToggleButtonGroupWithErrorDemoCode = `
import { RgoLabelBox, RgoInputToggleButtonGroup, type RgoInputToggleButtonGroupProps } from "@vireocodedev/starter-ui";
import React from "react";

const OPTIONS = ["Small", "Medium", "Large"];

type DemoProps = Partial<
  Omit<RgoInputToggleButtonGroupProps<string>, "value" | "onChange" | "options" | "renderOption" | "renderKey" | "multiple">
>;

export function RgoInputToggleButtonGroupWithErrorDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Size">
      <RgoInputToggleButtonGroup
        {...props}
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
        error
        helperText="Size selection is required"
      />
    </RgoLabelBox>
  );
}`;
