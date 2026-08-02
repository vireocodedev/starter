import { RgoLabelBox, type RgoLabelBoxProps } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { TextField } from "@mui/material";

type RgoLabelBoxWithDefaultPropsDemoProps = Partial<RgoLabelBoxProps>;

export function RgoLabelBoxWithDefaultPropsDemo({
  label = "Default label",
  children = <TextField variant="outlined" placeholder="Enter some text..." fullWidth />,
  ...props
}: RgoLabelBoxWithDefaultPropsDemoProps) {
  return (
    <RgoLabelBox label={label} {...props}>
      {children}
    </RgoLabelBox>
  );
}

export const RgoLabelBoxWithDefaultPropsDemoCode = `
import { RgoLabelBox, type RgoLabelBoxProps } from "@vireocodedev/starter-ui";
import { TextField } from "@mui/material";

type RgoLabelBoxWithDefaultPropsDemoProps = Partial<RgoLabelBoxProps>;

export function RgoLabelBoxWithDefaultPropsDemo({
  label = "Default label",
  children = <TextField variant="outlined" placeholder="Enter some text..." fullWidth />,
  ...props
}: RgoLabelBoxWithDefaultPropsDemoProps) {
  return (
    <RgoLabelBox label={label} {...props}>
      {children}
    </RgoLabelBox>
  );
}`;
