import { RgoLabelBox } from "@/core/public";
import {
  RgoInputToggleButtonGroup,
  type RgoInputToggleButtonGroupProps,
} from "@/components/inputs/RgoInputToggleButtonGroup/RgoInputToggleButtonGroup";
import React from "react";

const OPTIONS = ["Option A", "Option B", "Option C"];

type DemoProps = Partial<
  Omit<
    RgoInputToggleButtonGroupProps<string>,
    "value" | "onChange" | "options" | "renderOption" | "renderKey" | "disableClearable" | "multiple"
  >
>;

export function RgoInputToggleButtonGroupWithDisableClearableDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string | null>("Option A");

  return (
    <RgoLabelBox label="Selection (not clearable)">
      <RgoInputToggleButtonGroup
        {...props}
        disableClearable
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}

export const RgoInputToggleButtonGroupWithDisableClearableDemoCode = `
import { RgoLabelBox, RgoInputToggleButtonGroup, type RgoInputToggleButtonGroupProps } from "@vireocodedev/starter-ui";
import React from "react";

const OPTIONS = ["Option A", "Option B", "Option C"];

type DemoProps = Partial<
  Omit<
    RgoInputToggleButtonGroupProps<string>,
    "value" | "onChange" | "options" | "renderOption" | "renderKey" | "disableClearable"
  >
>;

export function RgoInputToggleButtonGroupWithDisableClearableDemo(props: DemoProps = {}) {
  const [value, setValue] = React.useState<string | null>("Option A");

  return (
    <RgoLabelBox label="Selection (not clearable)">
      <RgoInputToggleButtonGroup
        {...props}
        disableClearable
        options={OPTIONS}
        renderOption={option => option}
        renderKey={option => option}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}`;
