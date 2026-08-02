import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { TextField } from "@mui/material";

export const RgoLabelBoxWithRequiredIndicatorDemo = () => {
  return (
    <RgoLabelBox label="Password" required={true}>
      <TextField variant="outlined" type="password" placeholder="Enter your password" fullWidth />
    </RgoLabelBox>
  );
};

export const RgoLabelBoxWithRequiredIndicatorDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { TextField } from "@mui/material";

export const RgoLabelBoxWithRequiredIndicatorDemo = () => {
  return (
    <RgoLabelBox label="Password" required={true}>
      <TextField variant="outlined" type="password" placeholder="Enter your password" fullWidth />
    </RgoLabelBox>
  );
};`;
