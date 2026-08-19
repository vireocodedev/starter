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

export function RgoInputToggleButtonGroupWithDisabledDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string | null>("Medium");

  return (
    <RgoLabelBox label="Size">
      <RgoInputToggleButtonGroup
        {...props}
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
        disabled
      />
    </RgoLabelBox>
  );
}

export const RgoInputToggleButtonGroupWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputToggleButtonGroup, type RgoInputToggleButtonGroupProps } from "@vireocodedev/starter-ui";
import React from "react";

const OPTIONS = ["Small", "Medium", "Large"];

type DemoProps = Partial<
  Omit<RgoInputToggleButtonGroupProps<string>, "value" | "onChange" | "options" | "renderOption" | "renderKey" | "multiple">
>;

export function RgoInputToggleButtonGroupWithDisabledDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string | null>("Medium");

  return (
    <RgoLabelBox label="Size">
      <RgoInputToggleButtonGroup
        {...props}
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
        disabled
      />
    </RgoLabelBox>
  );
}`;
