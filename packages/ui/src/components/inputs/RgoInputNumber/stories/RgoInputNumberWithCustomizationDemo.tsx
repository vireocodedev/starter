import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputNumber, type RgoInputNumberProps } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { PartyMode } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import React from "react";

type RgoInputNumberWithCustomizationDemoProps = Partial<
  Omit<RgoInputNumberProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputNumberWithCustomizationDemo(
  props: RgoInputNumberWithCustomizationDemoProps = {
    helperText: "Example input using a custom date format",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber
        {...props}
        value={value}
        onChange={setValue}
        rgoSlotProps={{
          root: {
            // some custom TextField props

            fullWidth: true,
            placeholder: "Custom placeholder",
            slotProps: {
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PartyMode />
                  </InputAdornment>
                ),
              },
            },
          },
        }}
      />
    </RgoLabelBox>
  );
}

export const RgoInputNumberWithCustomizationDemoCode = `
import { RgoLabelBox, RgoInputNumber, type RgoInputNumberProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputNumberWithCustomizationDemoProps = Partial<
  Omit<RgoInputNumberProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputNumberWithCustomizationDemo(
  props: RgoInputNumberWithCustomizationDemoProps = {
    helperText: "Example input using a custom date format",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber
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
