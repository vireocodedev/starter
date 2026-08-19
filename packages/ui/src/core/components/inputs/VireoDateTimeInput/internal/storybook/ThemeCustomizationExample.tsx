import { VireoDateTimeInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
function customizedTheme(outerTheme: Theme) {
  return createTheme(outerTheme, {
    components: {
      VireoDateTimeInput: { styleOverrides: { root: { padding: 16, border: "1px solid #38bdf8", borderRadius: 12 } } },
    },
  });
}
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<number | null>(null);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoDateTimeInput value={value} onChange={setValue} pickerProps={{ label: "Review at" }} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
