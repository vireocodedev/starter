import { VireoFreeSoloAutocomplete } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const options = [
  { id: "public", label: "Public" },
  { id: "private", label: "Private" },
];
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoFreeSoloAutocomplete: {
        styleOverrides: { root: { padding: 16, border: "1px solid #4ade80", borderRadius: 12 } },
      },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoFreeSoloAutocomplete
          value={value}
          onChange={setValue}
          options={options}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          getStringValue={option => option.id}
          createSyntheticOption={text => ({ id: text, label: text })}
          addLabel={text => `Add “${text}”`}
          textFieldProps={{ label: "Visibility" }}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
