import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoTextInput } from "@vireocodedev/starter-ui";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoTextInput: {
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
  const [value, setValue] = useState("support@northstar.test");
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <VireoTextInput label="Support email" value={value} onChange={setValue} fullWidth />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
