import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoSwitchInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoSwitchInput: {
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
  const [value, setValue] = useState(true);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoSwitchInput label="Automatic updates" value={value} onChange={setValue} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
