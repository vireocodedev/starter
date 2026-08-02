import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { TextField } from "@mui/material";

export const RgoLabelBoxWithHelperTextDemo = () => {
  return (
    <RgoLabelBox label="Email Address" helperText="We'll never share your email with anyone else">
      <TextField variant="outlined" type="email" placeholder="Enter your email" fullWidth />
    </RgoLabelBox>
  );
};

export const RgoLabelBoxWithHelperTextDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { TextField } from "@mui/material";

export const RgoLabelBoxWithHelperTextDemo = () => {
  return (
    <RgoLabelBox 
      label="Email Address" 
      helperText="We'll never share your email with anyone else"
    >
      <TextField variant="outlined" type="email" placeholder="Enter your email" fullWidth />
    </RgoLabelBox>
  );
};`;
