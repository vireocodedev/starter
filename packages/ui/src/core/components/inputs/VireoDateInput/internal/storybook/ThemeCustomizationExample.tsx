import { VireoDateInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";

function customizedTheme(outerTheme: Theme) {
  return createTheme(outerTheme, {
    components: {
      VireoDateInput: { styleOverrides: { root: { padding: 16, border: "1px solid #a78bfa", borderRadius: 12 } } },
    },
  });
}

export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<number | null>(null);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoDateInput value={value} onChange={setValue} pickerProps={{ label: "Review date" }} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
