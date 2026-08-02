import { RgoSnack } from "@/components/data-display/RgoSnack/RgoSnack";

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export const RgoSnackWithIconDemo = () => {
  return <RgoSnack message="File uploaded successfully" startAdornment={<SuccessIcon />} />;
};

export const RgoSnackWithIconDemoCode = `import { RgoSnack } from "@/components/data-display/RgoSnack/RgoSnack";
import { RgoSnack } from "@/components/data-display/RgoSnack/RgoSnack";

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export const RgoSnackWithIconDemo = () => {
  return <RgoSnack message="File uploaded successfully" icon={<SuccessIcon />} />;
};`;
