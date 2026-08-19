import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoPasswordInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoPasswordInput: {
        styleOverrides: {
          root: {
            maxWidth: 420,
            "& .MuiOutlinedInput-root": { borderRadius: 12 },
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const [value, setValue] = useState("theme-secret");
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoPasswordInput label="Secret" value={value} onChange={setValue} fullWidth />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
