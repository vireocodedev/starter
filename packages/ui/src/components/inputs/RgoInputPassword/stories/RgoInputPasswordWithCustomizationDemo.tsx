import { RgoLabelBox } from "@/core/public";
import { RgoInputPassword, type RgoInputPasswordProps } from "@/components/inputs/RgoInputPassword/RgoInputPassword";
import { Lock, LockOpen } from "@mui/icons-material";
import React from "react";

type RgoInputPasswordWithCustomizationDemoProps = Partial<
  Omit<RgoInputPasswordProps, "value" | "onChange" | "visibilityIcon" | "visibilityOffIcon">
>;

export function RgoInputPasswordWithCustomizationDemo(
  props: RgoInputPasswordWithCustomizationDemoProps = {
    helperText: "Example input with custom visibility icons",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword
        {...props}
        value={value}
        onChange={setValue}
        visibilityIcon={<Lock />}
        visibilityOffIcon={<LockOpen />}
      />
    </RgoLabelBox>
  );
}

export const RgoInputPasswordWithCustomizationDemoCode = `
import { RgoLabelBox, RgoInputPassword, type RgoInputPasswordProps } from "@vireocodedev/starter-ui";
import { Lock, LockOpen } from "@mui/icons-material";
import React from "react";

type RgoInputPasswordWithCustomizationDemoProps = Partial<
  Omit<RgoInputPasswordProps, "value" | "onChange" | "visibilityIcon" | "visibilityOffIcon">
>;

export function RgoInputPasswordWithCustomizationDemo(
  props: RgoInputPasswordWithCustomizationDemoProps = {
    helperText: "Example input with custom visibility icons",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword
        {...props}
        value={value}
        onChange={setValue}
        visibilityIcon={<Lock />}
        visibilityOffIcon={<LockOpen />}
      />
    </RgoLabelBox>
  );
}`;
