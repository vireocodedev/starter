import { VireoFreeSoloAutocompleteMultiple } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const options = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
];
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoFreeSoloAutocompleteMultiple: {
        styleOverrides: { root: { padding: 16, border: "1px solid #facc15", borderRadius: 12 } },
      },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<string[] | null>([]);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoFreeSoloAutocompleteMultiple
          value={value}
          onChange={setValue}
          options={options}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          getStringValue={option => option.id}
          createSyntheticOption={text => ({ id: text, label: text })}
          addLabel={text => `Add “${text}”`}
          textFieldProps={{ label: "Skills" }}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
