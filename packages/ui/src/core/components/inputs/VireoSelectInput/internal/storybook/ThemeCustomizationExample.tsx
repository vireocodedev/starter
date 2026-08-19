import { VireoSelectInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const options = [
  { id: "low", label: "Low" },
  { id: "high", label: "High" },
];
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoSelectInput: {
        styleOverrides: {
          root: { padding: 16, border: "1px solid #c084fc", borderRadius: 12 },
          clearButton: { color: "#c084fc" },
        },
      },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<string | null>("high");
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoSelectInput
          value={value}
          onChange={setValue}
          options={options}
          getOptionValue={option => option.id}
          renderOption={option => option.label}
          label="Priority"
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
