import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { Box, Stack, TextField } from "@mui/material";

export const RgoLabelBoxWithMultipleFormElementsDemo = () => {
  return (
    <RgoLabelBox label="Multiple Form Elements" helperText="This label box contains multiple form elements">
      <Stack spacing={2}>
        <TextField variant="outlined" placeholder="First input" fullWidth />
        <TextField variant="outlined" placeholder="Second input" fullWidth />
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField variant="outlined" placeholder="Third" size="small" />
          <TextField variant="outlined" placeholder="Fourth" size="small" />
        </Box>
      </Stack>
    </RgoLabelBox>
  );
};

export const RgoLabelBoxWithMultipleFormElementsDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { Box, Stack, TextField } from "@mui/material";

export const RgoLabelBoxWithMultipleFormElementsDemo = () => {
  return (
    <RgoLabelBox 
      label="Multiple Form Elements" 
      helperText="This label box contains multiple form elements"
    >
      <Stack spacing={2}>
        <TextField variant="outlined" placeholder="First input" fullWidth />
        <TextField variant="outlined" placeholder="Second input" fullWidth />
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField variant="outlined" placeholder="Third" size="small" />
          <TextField variant="outlined" placeholder="Fourth" size="small" />
        </Box>
      </Stack>
    </RgoLabelBox>
  );
};`;
