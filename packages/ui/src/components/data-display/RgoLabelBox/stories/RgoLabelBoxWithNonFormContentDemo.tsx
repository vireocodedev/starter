import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { Box } from "@mui/material";

export const RgoLabelBoxWithNonFormContentDemo = () => {
  return (
    <RgoLabelBox label="Information Display" helperText="This shows non-form content within the label box">
      <Box
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
        }}
      >
        <Box sx={{ fontWeight: 500, mb: 1 }}>User Information</Box>
        <Box sx={{ color: "text.secondary" }}>
          Name: John Doe
          <br />
          Email: john.doe@example.com
          <br />
          Role: Administrator
        </Box>
      </Box>
    </RgoLabelBox>
  );
};

export const RgoLabelBoxWithNonFormContentDemoCode = `import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { Box } from "@mui/material";

export const RgoLabelBoxWithNonFormContentDemo = () => {
  return (
    <RgoLabelBox 
      label="Information Display" 
      helperText="This shows non-form content within the label box"
    >
      <Box
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
        }}
      >
        <Box sx={{ fontWeight: 500, mb: 1 }}>User Information</Box>
        <Box sx={{ color: "text.secondary" }}>
          Name: John Doe
          <br />
          Email: john.doe@example.com
          <br />
          Role: Administrator
        </Box>
      </Box>
    </RgoLabelBox>
  );
};`;
