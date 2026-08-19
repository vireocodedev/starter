import { Button, Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import { VireoSlidingScreenStack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { useState } from "react";

const theme = (outer: Theme) =>
  createTheme(outer, {
    components: {
      VireoSlidingScreenStack: {
        styleOverrides: {
          root: { border: "1px solid #56657a", borderRadius: 12 },
          screen: { padding: 24 },
        },
      },
    },
  });

export default function ThemeCustomizationExample() {
  const [activeScreen, setActiveScreen] = useState("first");
  const screens = [
    { id: "first", children: <Button onClick={() => setActiveScreen("second")}>Continue</Button> },
    {
      id: "second",
      children: (
        <Stack spacing={2}>
          <Typography>Theme overrides style every screen consistently.</Typography>
          <Button onClick={() => setActiveScreen("first")}>Start over</Button>
        </Stack>
      ),
    },
  ];

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <VireoSlidingScreenStack activeScreen={activeScreen} screens={screens} sx={{ minHeight: 180 }} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
