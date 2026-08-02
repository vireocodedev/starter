import { RgoSnack } from "@/components/data-display/RgoSnack/RgoSnack";
import { CircularProgress } from "@mui/material";

export const RgoSnackWithLoaderDemo = () => {
  return <RgoSnack message="Processing your request..." startAdornment={<CircularProgress size={16} />} />;
};

export const RgoSnackWithLoaderDemoCode = `import { RgoSnack } from "@/components/data-display/RgoSnack/RgoSnack";

export const RgoSnackWithLoaderDemo = () => {
  return (
    <RgoSnack 
      message="Processing your request..." 
      loader={true} 
    />
  );
};`;
