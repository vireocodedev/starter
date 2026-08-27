import { VireoToaster, toast } from "@vireocodedev/ui/sonner";
import { Button, CssBaseline, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";

const toasterId = "theme-customization";
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#a78bfa" },
    background: { default: "#080d18", paper: "#17132b" },
  },
  shape: { borderRadius: 14 },
  components: {
    VireoToaster: {
      defaultProps: { duration: 5000 },
      styleOverrides: { root: { "& [data-sonner-toast]": { borderInlineStart: "4px solid #a78bfa" } } },
    },
  },
});

export default function ThemeCustomizationExample() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        spacing={2}
        sx={{
          alignItems: "flex-start",
          minHeight: 480,
          width: "100%",
        }}
      >
        <Typography variant="h6">Branded notifications</Typography>
        <Button variant="contained" onClick={() => toast.success("Release published", { toasterId })}>
          Publish release
        </Button>
        <VireoToaster id={toasterId} />
      </Stack>
    </ThemeProvider>
  );
}
