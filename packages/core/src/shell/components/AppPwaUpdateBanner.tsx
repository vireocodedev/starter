import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Button, Snackbar } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Shows a persistent snackbar when a new app version is available.
 * The user can tap "Reload" to apply the update immediately.
 */
export function AppPwaUpdateBanner() {
  const { t } = usePlatformTranslation();

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const handleClose = () => {
    setNeedRefresh(false);
  };

  const handleReload = () => {
    updateServiceWorker(true);
  };

  return (
    <Snackbar
      open={needRefresh}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ bottom: { xs: 16, sm: 24 } }}
    >
      <Alert
        severity="info"
        onClose={handleClose}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={handleReload}
            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
          >
            {t("pwa.reload")}
          </Button>
        }
        sx={{ alignItems: "center", maxWidth: 400 }}
      >
        {t("pwa.newVersionAvailable")}
      </Alert>
    </Snackbar>
  );
}
