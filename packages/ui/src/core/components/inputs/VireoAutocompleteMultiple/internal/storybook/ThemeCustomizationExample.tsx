import { VireoAutocompleteMultiple } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const options = [
  { id: 1, label: "Critical" },
  { id: 2, label: "Warning" },
  { id: 3, label: "Info" },
];
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoAutocompleteMultiple: {
        styleOverrides: { root: { padding: 16, border: "1px solid #fb7185", borderRadius: 12 } },
      },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<(typeof options)[number][]>([]);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoAutocompleteMultiple
          value={value}
          onChange={setValue}
          options={options}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          textFieldProps={{ label: "Severities" }}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
