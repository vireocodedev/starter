import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoSliderInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoSliderInput: {
        styleOverrides: {
          root: {
            padding: 16,
            border: "1px solid #64748b",
            borderRadius: 12,
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const [value, setValue] = useState<number | null>(7);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoSliderInput aria-label="Retention days" value={value} onChange={setValue} min={1} max={30} step={1} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
