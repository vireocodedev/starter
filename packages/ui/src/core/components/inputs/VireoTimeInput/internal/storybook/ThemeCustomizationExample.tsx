import { VireoTimeInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoTimeInput: { styleOverrides: { root: { padding: 16, border: "1px solid #f59e0b", borderRadius: 12 } } },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<number | null>(null);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoTimeInput value={value} onChange={setValue} pickerProps={{ label: "Reminder time" }} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
