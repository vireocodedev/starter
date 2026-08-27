import { HomeOutlined } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material";
import { VireoApplicationNavigationItem } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const theme = createTheme({
  palette: { mode: "dark", primary: { main: "#f59e0b" } },
  components: {
    VireoApplicationNavigationItem: {
      styleOverrides: { root: { border: "1px solid rgba(245, 158, 11, 0.45)" } },
    },
  },
});

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={theme}>
        <VireoApplicationNavigationItem icon={<HomeOutlined />} label="Home" selected sx={{ maxWidth: 320 }} />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
