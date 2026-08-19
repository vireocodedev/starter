import { VireoDurationInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import React from "react";
const customizedTheme = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      VireoDurationInput: { styleOverrides: { root: { padding: 16, border: "1px solid #34d399", borderRadius: 12 } } },
    },
  });
export default function ThemeCustomizationExample() {
  const [value, setValue] = React.useState<number | null>(45);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={customizedTheme}>
        <VireoDurationInput value={value} onChange={setValue} fieldProps={{ label: "Timeout (minutes)" }} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
