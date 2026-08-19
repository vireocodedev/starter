import { RgoLabelBox } from "@/core/public";
import { RgoInputDateTime, type RgoInputDateTimeProps } from "@/components/inputs/RgoInputDateTime/RgoInputDateTime";
import React from "react";

type RgoInputDateTimeWithCustomizationDemoProps = Partial<
  Omit<RgoInputDateTimeProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputDateTimeWithCustomizationDemo(
  props: RgoInputDateTimeWithCustomizationDemoProps = {
    helperText: "Example input using a custom date format",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDateTime
        {...props}
        value={value}
        onChange={setValue}
        rgoSlotProps={{
          root: {
            format: "DD.MM.YYYY HH:mm",
          },
        }}
      />
    </RgoLabelBox>
  );
}

export const RgoInputDateTimeWithCustomizationDemoCode = `
import { RgoLabelBox, RgoInputDateTime, type RgoInputDateTimeProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDateTimeWithCustomizationDemoProps = Partial<
  Omit<RgoInputDateTimeProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputDateTimeWithCustomizationDemo(
  props: RgoInputDateTimeWithCustomizationDemoProps = {
    helperText: "Example input using a custom date format",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDateTime
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
