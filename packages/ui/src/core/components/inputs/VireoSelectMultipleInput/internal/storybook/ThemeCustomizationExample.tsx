import { VireoSelectMultipleInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const options = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
];
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoSelectMultipleInput: {
        styleOverrides: { root: { padding: 16, border: "1px solid #22d3ee", borderRadius: 12 } },
      },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<string[]>(["read"]);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoSelectMultipleInput
          value={value}
          onChange={setValue}
          options={options}
          getOptionValue={option => option.id}
          renderOption={option => option.label}
          label="Permissions"
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
