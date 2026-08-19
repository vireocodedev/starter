import { VireoAutocomplete } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const options = [
  { id: 1, label: "Open" },
  { id: 2, label: "Closed" },
];
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoAutocomplete: { styleOverrides: { root: { padding: 16, border: "1px solid #60a5fa", borderRadius: 12 } } },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<(typeof options)[number] | null>(null);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoAutocomplete
          value={value}
          onChange={setValue}
          options={options}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          textFieldProps={{ label: "Status" }}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
