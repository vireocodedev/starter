import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { TextField } from "@mui/material";

export const RgoLabelBoxWithCustomColorDemo = () => {
  return (
    <RgoLabelBox label="Custom Color Label" color="#e91e63">
      <TextField variant="outlined" placeholder="Enter some text..." fullWidth />
    </RgoLabelBox>
  );
};

export const RgoLabelBoxWithCustomColorDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { TextField } from "@mui/material";

export const RgoLabelBoxWithCustomColorDemo = () => {
  return (
    <RgoLabelBox label="Custom Color Label" color="#e91e63">
      <TextField variant="outlined" placeholder="Enter some text..." fullWidth />
    </RgoLabelBox>
  );
};`;
