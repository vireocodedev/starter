import { type AppConfig } from "@/config/app.config.types";
import { type AppShellRuntime } from "@/shell/app.shell-runtime.types";
import { AppShellProvider } from "@/shell/AppShellContext";
import { AppMobileNavDrawer } from "@/shell/components/AppMobileNavDrawer";
import { AppPwaUpdateBanner } from "@/shell/components/AppPwaUpdateBanner";
import { AppSkipToContentLink } from "@/shell/components/AppSkipToContentLink";
import { useResizableNav } from "@/shell/hooks/useResizableNav";
import { useShellViewportWidth } from "@/shell/hooks/useShellViewport";
import {
  createWindowControlsOverlayRootStyle,
  useWindowControlsOverlay,
} from "@/shell/hooks/useWindowControlsOverlay";
import { resolveWindowControlsOverlayDesktopNavWidth } from "@/shell/hooks/windowControlsOverlay.utils";
import { AppLayoutHeader } from "@/shell/layout/AppLayoutHeader";
import { AppLayoutNav } from "@/shell/layout/AppLayoutNav";
import { AppMobileBottomNavigation } from "@/shell/layout/AppMobileBottomNavigation";
import { AppNavLayoutContext } from "@/shell/layout/AppNavLayoutContext";
import {
  NAV_MIN_EXPANDED_WIDTH,
  NAV_WIDTH_CSS_VAR,
} from "@/shell/layout/layoutNav.constants";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import { APP_PAGE_CONTENT_MIN_WIDTH } from "@vireocodedev/starter-ui";
import React from "react";
import { Outlet, useLocation } from "react-router";

export type AppShellLayoutProps = {
  config: AppConfig;
  runtime: AppShellRuntime;
};

export function AppShellLayout({ config, runtime }: AppShellLayoutProps) {
  const theme = useTheme();
  const { t } = usePlatformTranslation();
  const {
    preferences: {
      navCollapsed,
      navLocked: runtimeNavLocked,
      navWidth,
      setNavCollapsed,
      setNavWidth,
    },
  } = runtime;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pathname } = useLocation();
  const loginPath = config.routes.getPath(config.routes.loginPage);
  const loginMode =
    pathname === loginPath || pathname.startsWith(`${loginPath}/`);
  const navLocked = loginMode ? true : runtimeNavLocked;
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [headerActions, setHeaderActions] =
    React.useState<React.ReactNode>(null);
  const viewportWidth = useShellViewportWidth();
  const windowControlsOverlay = useWindowControlsOverlay();
  const shellRootRef = React.useRef<HTMLDivElement | null>(null);

  const maxDesktopNavWidth = React.useMemo(() => {
    return Math.max(
      NAV_MIN_EXPANDED_WIDTH,
      viewportWidth - APP_PAGE_CONTENT_MIN_WIDTH,
    );
  }, [viewportWidth]);

  const {
    desktopCollapsed,
    desktopNavWidth,
    desktopResizing,
    onResizeDoubleClick,
    onResizeStart,
    onToggleCollapsed,
  } = useResizableNav({
    initialCollapsed: navCollapsed,
    initialWidth: navWidth,
    isMobile,
    loginMode,
    maxDesktopNavWidth,
    navLocked,
    setNavCollapsed,
    setNavWidth,
    shellRootRef,
  });

  const visibleDesktopNavWidth = React.useMemo(
    () =>
      resolveWindowControlsOverlayDesktopNavWidth({
        desktopNavWidth,
        isMobile,
        windowControlsOverlay,
      }),
    [desktopNavWidth, isMobile, windowControlsOverlay],
  );

  const openMobileNav = React.useCallback(() => {
    setMobileNavOpen(true);
  }, []);

  const closeMobileNav = React.useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  React.useEffect(() => {
    setHeaderActions(null);
  }, [pathname]);

  const navLayoutContextValue = React.useMemo(
    () => ({
      isMobile,
      openMobileNav,
      desktopNavWidth: visibleDesktopNavWidth,
      setHeaderActions,
    }),
    [isMobile, openMobileNav, visibleDesktopNavWidth],
  );

  const shellStyle = React.useMemo(
    () =>
      ({
        ...createWindowControlsOverlayRootStyle(windowControlsOverlay),
        [NAV_WIDTH_CSS_VAR]: `${visibleDesktopNavWidth}px`,
      } as React.CSSProperties),
    [visibleDesktopNavWidth, windowControlsOverlay],
  );

  return (
    <AppShellProvider config={config} runtime={runtime}>
      <AppNavLayoutContext.Provider value={navLayoutContextValue}>
        <Box
          ref={shellRootRef}
          data-window-controls-overlay={
            windowControlsOverlay.visible ? "visible" : undefined
          }
          style={shellStyle}
          sx={{ minWidth: 0, height: "100%", position: "relative" }}
        >
          <AppSkipToContentLink label={t("common.skipToMainContent")} />
          <AppPwaUpdateBanner />

          {!isMobile ? (
            <AppLayoutNav
              width={`var(${NAV_WIDTH_CSS_VAR})`}
              collapsed={loginMode ? false : desktopCollapsed}
              mobile={false}
              navLocked={navLocked}
              loginMode={loginMode}
              isResizing={desktopResizing}
              onToggleCollapsed={onToggleCollapsed}
              onResizeStart={onResizeStart}
              onResizeDoubleClick={onResizeDoubleClick}
            />
          ) : null}

          <AppMobileNavDrawer
            config={config}
            open={isMobile && mobileNavOpen}
            loginMode={loginMode}
            onClose={closeMobileNav}
          />

          <Box
            sx={{
              marginLeft: !isMobile ? `var(${NAV_WIDTH_CSS_VAR})` : 0,
              bgcolor: "background.default",
              height: isMobile
                ? `calc(100% - ${config.brand.navigation.bottomNavHeightPx}px - env(safe-area-inset-bottom, 0px))`
                : "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: desktopResizing
                ? "none"
                : theme.transitions.create(["margin-left"], {
                    duration: theme.transitions.duration.shortest,
                  }),
            }}
          >
            <AppLayoutHeader actions={headerActions} />
            <Box
              component="main"
              id="main-content"
              tabIndex={-1}
              sx={{ flex: 1, minHeight: 0, overflow: "auto", outline: "none" }}
            >
              <Outlet />
            </Box>
          </Box>

          {isMobile && <AppMobileBottomNavigation />}
        </Box>
      </AppNavLayoutContext.Provider>
    </AppShellProvider>
  );
}
