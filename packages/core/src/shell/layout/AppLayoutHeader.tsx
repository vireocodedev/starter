import { type AppRouteHandle } from "@/config/app.config.routes.types";
import { AppBrandLogo } from "@/shell/components/AppBrandLogo";
import {
  APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR,
  APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR,
  APP_WINDOW_CONTROLS_OVERLAY_RIGHT_INSET_CSS_VAR,
} from "@/shell/hooks/useWindowControlsOverlay";
import { useAppNavLayout } from "@/shell/layout/AppNavLayoutContext";
import { getLayoutBorderColor } from "@/shell/layout/layout.tokens";
import { useAppShellContext } from "@/shell/useAppShellContext";
import { Box, Container, Typography } from "@mui/material";
import React, { type ReactNode } from "react";
import { useMatches } from "react-router";

export type AppLayoutHeaderProps = {
  actions?: ReactNode;
};

export function AppLayoutHeader({ actions }: AppLayoutHeaderProps) {
  const matches = useMatches();
  const {
    config,
    runtime: {
      i18n: { t },
      preferences: { pageBodyMaxWidth },
    },
  } = useAppShellContext();
  const { isMobile } = useAppNavLayout();

  const currentBreadcrumb = React.useMemo(
    () =>
      matches
        .map(match => {
          const handle = match?.handle as AppRouteHandle | undefined;
          return handle?.breadcrumb ? handle.breadcrumb(t, match.params) : null;
        })
        .filter((breadcrumb): breadcrumb is string => Boolean(breadcrumb))
        .at(-1),
    [matches, t],
  );

  return (
    <Box
      className="app-window-titlebar app-window-titlebar-main"
      //className="AppLayoutHeader"
      sx={{
        minHeight: `max(64px, var(${APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR}, 0px))`,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: getLayoutBorderColor,
        position: "sticky",
        top: 0,
        zIndex: theme => theme.zIndex.appBar,
      }}
    >
      <Container
        maxWidth={pageBodyMaxWidth}
        sx={{
          pl: isMobile ? `calc(12px + var(${APP_WINDOW_CONTROLS_OVERLAY_LEFT_INSET_CSS_VAR}, 0px))` : 1.5,
          pr: `calc(12px + var(${APP_WINDOW_CONTROLS_OVERLAY_RIGHT_INSET_CSS_VAR}, 0px))`,
        }}
      >
        <Box
          sx={{
            minHeight: `max(64px, var(${APP_WINDOW_CONTROLS_OVERLAY_HEIGHT_CSS_VAR}, 0px))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            {isMobile && <AppBrandLogo brand={config.brand} />}

            {currentBreadcrumb ? (
              <Typography
                component="span"
                fontWeight={600}
                color="text.primary"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                sx={{
                  minWidth: 0,
                  fontSize: "1.5rem",
                  letterSpacing: "0.04em",
                }}
              >
                {currentBreadcrumb}
              </Typography>
            ) : null}
          </Box>

          {actions ? <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>{actions}</Box> : null}
        </Box>
      </Container>
    </Box>
  );
}
