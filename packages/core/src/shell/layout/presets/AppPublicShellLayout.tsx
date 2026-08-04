import { type AppConfig, type AppShellNavEntry } from "@/config/app.config.types";
import { type AppShellRuntime } from "@/shell/app.shell-runtime.types";
import { AppShellProvider } from "@/shell/AppShellContext";
import { AppBrandLogo } from "@/shell/components/AppBrandLogo";
import { AppPwaUpdateBanner } from "@/shell/components/AppPwaUpdateBanner";
import { AppSkipToContentLink } from "@/shell/components/AppSkipToContentLink";
import {
  APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR,
  APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR,
  APP_WINDOW_CONTROLS_OVERLAY_RIGHT_INSET_CSS_VAR,
  createWindowControlsOverlayRootStyle,
  useWindowControlsOverlay,
} from "@/shell/hooks/useWindowControlsOverlay";
import { AppNavLayoutContext } from "@/shell/layout/AppNavLayoutContext";
import { getLayoutBorderColor } from "@/shell/layout/layout.tokens";
import { Box, Button, Container, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { RgoIcon } from "@vireocodedev/starter-ui";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export type AppPublicShellLayoutProps = {
  config: AppConfig;
  runtime: AppShellRuntime;
};

function getPublicNavItems(entries: AppShellNavEntry[]): Extract<AppShellNavEntry, { type: "item" }>[] {
  return entries.filter((entry): entry is Extract<AppShellNavEntry, { type: "item" }> => entry.type === "item");
}

export function AppPublicShellLayout({ config, runtime }: AppPublicShellLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t: tPlatform } = usePlatformTranslation();
  const {
    i18n: { t },
    permissions: { canAccess },
  } = runtime;
  const windowControlsOverlay = useWindowControlsOverlay();
  const windowControlsOverlayStyle = React.useMemo(
    () => createWindowControlsOverlayRootStyle(windowControlsOverlay),
    [windowControlsOverlay],
  );

  const navItems = React.useMemo(() => {
    const entries = config.shell.publicNavEntries ?? config.shell.loginNavEntries;
    return getPublicNavItems(entries).filter(item => canAccess(item.permission));
  }, [canAccess, config.shell.loginNavEntries, config.shell.publicNavEntries]);

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
        <AppSkipToContentLink label={tPlatform("common.skipToMainContent")} />
        <AppPwaUpdateBanner />
        <Box
          data-window-controls-overlay={windowControlsOverlay.visible ? "visible" : undefined}
          style={windowControlsOverlayStyle}
          sx={{ height: "100%", bgcolor: "background.default", display: "flex", flexDirection: "column" }}
        >
          <Box
            component="header"
            className="app-window-titlebar app-window-titlebar-public"
            sx={{
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: getLayoutBorderColor,
              position: "sticky",
              top: 0,
              zIndex: theme => theme.zIndex.appBar,
            }}
          >
            <Container
              maxWidth="lg"
              sx={{
                pl: {
                  xs: `calc(16px + var(${APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR}, 0px))`,
                  sm: `calc(24px + var(${APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR}, 0px))`,
                },
                pr: {
                  xs: `calc(16px + var(${APP_WINDOW_CONTROLS_OVERLAY_RIGHT_INSET_CSS_VAR}, 0px))`,
                  sm: `calc(24px + var(${APP_WINDOW_CONTROLS_OVERLAY_RIGHT_INSET_CSS_VAR}, 0px))`,
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                minHeight={`max(64px, var(${APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR}, 0px))`}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
                  <AppBrandLogo brand={config.brand} />
                  <Typography fontWeight={700} noWrap>
                    {config.brand.name}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  component="nav"
                  aria-label={tPlatform("common.mainNavigation")}
                >
                  {navItems.map(item => {
                    const itemPath = item.to ?? (item.page ? config.routes.getPath(item.page) : undefined);
                    const selected = Boolean(
                      itemPath && (pathname === itemPath || pathname.startsWith(`${itemPath}/`)),
                    );

                    return (
                      <Button
                        key={`${itemPath ?? item.label(t)}`}
                        size="small"
                        disabled={item.disabled}
                        color={selected ? "primary" : "inherit"}
                        startIcon={<RgoIcon icon={item.icon} width={16} height={16} />}
                        onClick={() => {
                          if (!itemPath || item.disabled) {
                            return;
                          }

                          navigate(itemPath);
                        }}
                      >
                        {item.label(t)}
                      </Button>
                    );
                  })}
                </Stack>
              </Stack>
            </Container>
          </Box>

          <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, minHeight: 0, outline: "none" }}>
            <Outlet />
          </Box>
        </Box>
      </AppNavLayoutContext.Provider>
    </AppShellProvider>
  );
}
