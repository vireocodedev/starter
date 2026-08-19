import { RgoLabelBox } from "@/core/public";
import { RgoInputText, type RgoInputTextProps } from "@/components/inputs/RgoInputText/RgoInputText";
import React from "react";

type RgoInputTextWithCustomizationDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange" | "rgoSlotProps">>;

export function RgoInputTextWithCustomizationDemo(
  props: RgoInputTextWithCustomizationDemoProps = {
    helperText: "Example input using a custom text variant",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText
        {...props}
        value={value}
        onChange={setValue}
        rgoSlotProps={{
          root: {
            variant: "standard",
            placeholder: "Enter your text here...",
          },
        }}
      />
    </RgoLabelBox>
  );
}

export const RgoInputTextWithCustomizationDemoCode = `
import { RgoLabelBox, RgoInputText, type RgoInputTextProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTextWithCustomizationDemoProps = Partial<
  Omit<RgoInputTextProps, "value" | "onChange" | "rgoSlotProps">
>;

export function RgoInputTextWithCustomizationDemo(
  props: RgoInputTextWithCustomizationDemoProps = {
    helperText: "Example input using a custom text variant",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText
        {...props}
        value={value}
        onChange={setValue}
        rgoSlotProps={{
          root: {
            variant: "outlined",
            placeholder: "Enter your text here...",
          },
        }}
      />
    </RgoLabelBox>
  );
}`;
