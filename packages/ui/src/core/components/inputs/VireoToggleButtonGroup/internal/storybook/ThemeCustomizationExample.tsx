import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoToggleButtonGroup } from "@vireocodedev/starter-ui";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoToggleButtonGroup: {
        styleOverrides: {
          root: {
            padding: 12,
            border: "1px solid #64748b",
            borderRadius: 12,
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const [value, setValue] = useState<string | null>("comfortable");
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoToggleButtonGroup
          options={["compact", "comfortable"]}
          renderOption={option => option}
          renderKey={option => option}
          value={value}
          onChange={setValue}
          disableClearable
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
