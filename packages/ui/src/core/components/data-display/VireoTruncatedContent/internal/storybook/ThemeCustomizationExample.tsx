import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Box, Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoTruncatedContent: {
        defaultProps: { collapsedHeight: 56 },
        styleOverrides: {
          root: { padding: 16, border: "1px solid #a78bfa", borderRadius: 12, backgroundColor: "#171225" },
          viewport: { borderRadius: 6 },
          content: { color: "#ddd6fe" },
          toggle: { color: "#c4b5fd", fontWeight: 700 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <Box width={360} maxWidth="100%">
          <VireoTruncatedContent expandLabel="Show more" collapseLabel="Show less">
            <Stack spacing={1}>
              <Typography fontWeight={700}>Theme-customized content</Typography>
              <Typography variant="body2">Theme defaults and slot overrides establish the shared treatment.</Typography>
              <Typography variant="body2">This line provides enough content to exercise truncation.</Typography>
            </Stack>
          </VireoTruncatedContent>
        </Box>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
