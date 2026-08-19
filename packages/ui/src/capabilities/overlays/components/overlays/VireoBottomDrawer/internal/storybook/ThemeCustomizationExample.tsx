import { VireoBottomDrawer, VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Button, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import { useState } from "react";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoBottomDrawer: {
        defaultProps: { useBackdrop: false },
        styleOverrides: { puller: { backgroundColor: "#2e1065", "&::after": { backgroundColor: "#a78bfa" } } },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const [open, setOpen] = useState(false);
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <Box sx={{ bgcolor: "background.paper", p: 3 }}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Open themed drawer
          </Button>
        </Box>
        <VireoBottomDrawer open={open} onClose={() => setOpen(false)}>
          <VireoOverlayHeader title="Themed filters" closeLabel="Close filters" onClose={() => setOpen(false)} />
          <Typography sx={{ p: 3 }}>Theme defaults remove the backdrop and recolor the puller.</Typography>
        </VireoBottomDrawer>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
