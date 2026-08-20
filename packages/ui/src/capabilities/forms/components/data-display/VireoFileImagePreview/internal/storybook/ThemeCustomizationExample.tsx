import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoFileImagePreview } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const imageFile = new File(
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420"><rect width="800" height="420" fill="#312e81"/><path d="M0 360 210 140l170 180 120-120 300 160v60H0Z" fill="#fbbf24"/></svg>`,
  ],
  "release-banner.svg",
  { type: "image/svg+xml" },
);

function createPreviewTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFileImagePreview: {
        defaultProps: { objectFit: "cover" },
        styleOverrides: {
          root: { backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid #8b5cf6", borderRadius: 12 },
          image: { maxHeight: 200 },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createPreviewTheme}>
        <VireoFileImagePreview file={imageFile} alt="Release banner" sx={{ maxWidth: 600 }} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
