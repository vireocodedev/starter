import { AppBrandLogo } from "@/shell/components/AppBrandLogo";
import { useAppShellContext } from "@/shell/useAppShellContext";
import { Box, CircularProgress, Typography } from "@mui/material";

export function AppAuthTransitionScreen({ fullscreen = true }: { fullscreen?: boolean }) {
  const {
    config,
    runtime: {
      i18n: { t },
    },
  } = useAppShellContext();

  return (
    <Box
      sx={{
        minHeight: fullscreen ? "100dvh" : "100%",
        bgcolor: "background.default",
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5, textAlign: "center" }}>
        <AppBrandLogo brand={config.brand} variant="brand" />
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          {t("common.loading")}...
        </Typography>
      </Box>
    </Box>
  );
}
