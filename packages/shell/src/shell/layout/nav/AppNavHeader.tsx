import { type AppBrand } from "@/config/app.config.brand";
import { AppBrandLogo } from "@/shell/components/AppBrandLogo";
import {
  APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR,
  APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR,
} from "@/shell/hooks/useWindowControlsOverlay";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

export function AppNavHeader({
  brand,
  closeNavigationLabel,
  collapsed,
  collapseLabel,
  expandLabel,
  mobile,
  navLocked,
  onClose,
  onToggleCollapsed,
}: {
  brand: AppBrand;
  closeNavigationLabel: string;
  collapsed: boolean;
  collapseLabel: string;
  expandLabel: string;
  mobile: boolean;
  navLocked: boolean;
  onClose?: () => void;
  onToggleCollapsed?: () => void;
}) {
  return (
    <Box
      className="app-window-titlebar app-window-titlebar-nav"
      sx={{
        pl: mobile ? 1 : `calc(8px + var(${APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR}, 0px))`,
        pr: mobile ? 2 : 1,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: collapsed ? 0 : 1,
        height: `max(64.5px, var(${APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR}, 0px))`,
        minHeight: `max(64.5px, var(${APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR}, 0px))`,
        borderBottom: "1px solid var(--mui-palette-grey-300)",
      }}
    >
      {collapsed && navLocked && <AppBrandLogo brand={brand} />}

      {!collapsed && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, ml: 1.5 }}>
          <AppBrandLogo brand={brand} />
          <Typography fontWeight={700} fontSize={24} letterSpacing="0.04em" noWrap>
            {brand.name}
          </Typography>
        </Box>
      )}

      {!mobile && !navLocked ? (
        <Tooltip title={collapsed ? expandLabel : collapseLabel}>
          <IconButton size="small" onClick={onToggleCollapsed}>
            {collapsed ? <ChevronRightRoundedIcon fontSize="small" /> : <ChevronLeftRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      ) : null}

      {mobile ? (
        <IconButton size="small" onClick={onClose} aria-label={closeNavigationLabel}>
          <CloseRoundedIcon />
        </IconButton>
      ) : null}
    </Box>
  );
}
