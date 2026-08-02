import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputDate, type RgoInputDateProps } from "@/components/inputs/RgoInputDate/RgoInputDate";
import React from "react";

type RgoInputDateWithCustomizationDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange" | "rgoSlotProps">>;

export function RgoInputDateWithCustomizationDemo(
  props: RgoInputDateWithCustomizationDemoProps = {
    helperText: "Example input using a custom date format",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate
        {...props}
        value={value}
        onChange={setValue}
        rgoSlotProps={{
          root: {
            format: "DD.MM.YYYY",
          },
        }}
      />
    </RgoLabelBox>
  );
}

export const RgoInputDateWithCustomizationDemoCode = `
import { RgoLabelBox, RgoInputDate, type RgoInputDateProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDateWithCustomizationDemoProps = Partial<
  Omit<RgoInputDateProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputDateWithCustomizationDemo(
  props: RgoInputDateWithCustomizationDemoProps = {
    helperText: "Example input using a custom date format",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate
        {...props}
        value={value}
        onChange={setValue}
        rgoSlotProps={{
          datePicker: {
            format: "DD.MM.YYYY",
          },
        }}
      />
    </RgoLabelBox>
  );
}`;
