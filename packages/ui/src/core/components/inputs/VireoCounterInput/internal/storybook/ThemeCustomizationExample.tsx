import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoCounterInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoCounterInput: {
        styleOverrides: {
          root: {
            maxWidth: 280,
            "& .MuiOutlinedInput-root": { borderRadius: 14 },
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const [value, setValue] = useState<number | null>(2);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoCounterInput label="Retries" value={value} onChange={setValue} min={0} max={5} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
