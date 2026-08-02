import { RgoInputSwitch, type RgoInputSwitchProps } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import React from "react";

type RgoInputSwitchWithCustomizationDemoProps = Partial<
  Omit<RgoInputSwitchProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputSwitchWithCustomizationDemo(
  props: RgoInputSwitchWithCustomizationDemoProps = {
    helperText: "Example input with custom switch styling",
  },
) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return (
    <RgoInputSwitch
      {...props}
      label="Toggle option"
      value={value}
      onChange={setValue}
      rgoSlotProps={{
        formControlLabelSwitch: {
          color: "secondary",
          size: "medium",
        },
        formControlLabelTypography: {
          color: "primary",
        },
      }}
    />
  );
}

export const RgoInputSwitchWithCustomizationDemoCode = `
import { RgoInputSwitch, type RgoInputSwitchProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSwitchWithCustomizationDemoProps = Partial<
  Omit<RgoInputSwitchProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputSwitchWithCustomizationDemo(
  props: RgoInputSwitchWithCustomizationDemoProps = {
    helperText: "Example input with custom switch styling",
  },
) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return (
    <RgoInputSwitch
      {...props}
      label="Toggle option"
      value={value}
      onChange={setValue}
      rgoSlotProps={{
        formControlLabelSwitch: {
          color: "secondary",
          size: "medium",
        },
        formControlLabelTypography: {
          color: "primary",
        },
      }}
    />
  );
}`;
