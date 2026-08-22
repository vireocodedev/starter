import { type AppConfig } from "@/config/app.config.types";
import { type AppShellRuntime } from "@/shell/app.shell-runtime.types";
import { AppShellProvider } from "@/shell/AppShellContext";
import { AppPwaUpdateBanner } from "@/shell/components/AppPwaUpdateBanner";
import { AppSkipToContentLink } from "@/shell/components/AppSkipToContentLink";
import { createWindowControlsOverlayRootStyle, useWindowControlsOverlay } from "@/shell/hooks/useWindowControlsOverlay";
import { AppNavLayoutContext } from "@/shell/layout/AppNavLayoutContext";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-ui/react-i18next";
import React from "react";
import { Outlet } from "react-router";

export type AppBareShellLayoutProps = {
  config: AppConfig;
  runtime: AppShellRuntime;
};

export function AppBareShellLayout({ config, runtime }: AppBareShellLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const windowControlsOverlay = useWindowControlsOverlay();
  const { t } = usePlatformTranslation();
  const windowControlsOverlayStyle = React.useMemo(
    () => createWindowControlsOverlayRootStyle(windowControlsOverlay),
    [windowControlsOverlay],
  );

  return (
    <AppShellProvider config={config} runtime={runtime}>
      <AppNavLayoutContext.Provider
        value={{
          isMobile,
          openMobileNav: () => undefined,
          desktopNavWidth: 0,
          setHeaderActions: () => undefined,
        }}
      >
        <AppSkipToContentLink label={t("common.skipToMainContent")} />
        <AppPwaUpdateBanner />
        <Box
          data-window-controls-overlay={windowControlsOverlay.visible ? "visible" : undefined}
          style={windowControlsOverlayStyle}
          sx={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          <Box className="app-window-titlebar-bare" aria-hidden="true" />
          <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, minHeight: 0, outline: "none" }}>
            <Outlet />
          </Box>
        </Box>
      </AppNavLayoutContext.Provider>
    </AppShellProvider>
  );
}
