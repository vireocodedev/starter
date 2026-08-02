import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { Stack, TextField } from "@mui/material";

export const RgoLabelBoxWithDifferentFontWeightsDemo = () => {
  return (
    <Stack spacing={3}>
      <RgoLabelBox label="Light Weight (300)" fontWeight={300}>
        <TextField variant="outlined" placeholder="Font weight 300" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Normal Weight (400)" fontWeight={400}>
        <TextField variant="outlined" placeholder="Font weight 400" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Medium Weight (500)" fontWeight={500}>
        <TextField variant="outlined" placeholder="Font weight 500" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Semi-bold Weight (600)" fontWeight={600}>
        <TextField variant="outlined" placeholder="Font weight 600" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Bold Weight (700)" fontWeight={700}>
        <TextField variant="outlined" placeholder="Font weight 700" fullWidth />
      </RgoLabelBox>
    </Stack>
  );
};

export const RgoLabelBoxWithDifferentFontWeightsDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { Stack, TextField } from "@mui/material";

export const RgoLabelBoxWithDifferentFontWeightsDemo = () => {
  return (
    <Stack spacing={3}>
      <RgoLabelBox label="Light Weight (300)" fontWeight={300}>
        <TextField variant="outlined" placeholder="Font weight 300" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Normal Weight (400)" fontWeight={400}>
        <TextField variant="outlined" placeholder="Font weight 400" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Medium Weight (500)" fontWeight={500}>
        <TextField variant="outlined" placeholder="Font weight 500" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Semi-bold Weight (600)" fontWeight={600}>
        <TextField variant="outlined" placeholder="Font weight 600" fullWidth />
      </RgoLabelBox>
      <RgoLabelBox label="Bold Weight (700)" fontWeight={700}>
        <TextField variant="outlined" placeholder="Font weight 700" fullWidth />
      </RgoLabelBox>
    </Stack>
  );
};`;
