import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoNumberInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoNumberInput: {
        styleOverrides: {
          root: {
            maxWidth: 320,
            "& .MuiOutlinedInput-root": { borderRadius: 12 },
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const [value, setValue] = useState<number | null>(42);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoNumberInput label="Seats" value={value} onChange={setValue} min={1} max={100} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
