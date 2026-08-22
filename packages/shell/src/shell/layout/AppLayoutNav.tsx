import { type AppShellNavEntry } from "@/config/app.config.types";
import { getLayoutBorderColor } from "@/shell/layout/layout.tokens";
import { AppNavControlPopover } from "@/shell/layout/nav/AppNavControlPopover";
import { AppNavHeader } from "@/shell/layout/nav/AppNavHeader";
import { AppNavList } from "@/shell/layout/nav/AppNavList";
import { AppNavResizeHandle } from "@/shell/layout/nav/AppNavResizeHandle";
import { useVisibleNavEntries } from "@/shell/layout/nav/useVisibleNavEntries";
import { useAppShellContext } from "@/shell/useAppShellContext";
import { Box } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-ui/react-i18next";
import React from "react";
import { useLocation, useNavigate } from "react-router";

export type AppLayoutNavProps = {
  width: number | string;
  collapsed: boolean;
  mobile: boolean;
  navLocked?: boolean;
  isResizing?: boolean;
  loginMode?: boolean;
  onToggleCollapsed?: () => void;
  onResizeStart?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onResizeDoubleClick?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
};

export function AppLayoutNav({
  width,
  collapsed,
  mobile,
  navLocked = false,
  isResizing = false,
  loginMode = false,
  onToggleCollapsed,
  onResizeStart,
  onResizeDoubleClick,
  onNavigate,
  onClose,
}: AppLayoutNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t: tPlatform } = usePlatformTranslation();
  const {
    config,
    runtime: {
      i18n: { t },
      permissions: { canAccess },
    },
  } = useAppShellContext();
  const [openControl, setOpenControl] = React.useState<{ id: string; anchorEl: HTMLElement } | null>(null);
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});
  const isCollapsed = !mobile && collapsed;
  const AccountSlotComponent = config.shell.accountSlot?.Component;
  const navControls = config.shell.navControls;

  const visibleNavEntries = useVisibleNavEntries({
    canAccess,
    collapsedSections,
    isCollapsed,
    loginMode,
    loginNavEntries: config.shell.loginNavEntries as AppShellNavEntry[],
    navControls,
    navEntries: config.shell.navEntries as AppShellNavEntry[],
    navSlots: config.shell.navSlots,
  });

  const onNavigateTo = (to: string) => {
    navigate(to);
    onNavigate?.();
  };

  const onOpenControlPopover = (controlId: string, event: React.MouseEvent<HTMLElement>) => {
    setOpenControl({ id: controlId, anchorEl: event.currentTarget });
  };

  const onCloseControlPopover = () => {
    setOpenControl(null);
  };

  const onToggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <Box
      component="nav"
      aria-label={tPlatform("common.mainNavigation")}
      sx={{
        width,
        borderRight: "1px solid",
        borderColor: getLayoutBorderColor,
        bgcolor: "background.paper",
        position: mobile ? "relative" : "absolute",
        top: mobile ? "auto" : 0,
        left: mobile ? "auto" : 0,
        height: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1200,
      }}
    >
      <AppNavHeader
        brand={config.brand}
        closeNavigationLabel={tPlatform("common.closeNavigation")}
        collapsed={isCollapsed}
        collapseLabel={tPlatform("common.collapse")}
        expandLabel={tPlatform("common.expand")}
        mobile={mobile}
        navLocked={navLocked}
        onClose={onClose}
        onToggleCollapsed={onToggleCollapsed}
      />

      <AppNavList
        collapsedSections={collapsedSections}
        config={config}
        isCollapsed={isCollapsed}
        mobile={mobile}
        navControls={navControls}
        navSlots={config.shell.navSlots}
        onNavigate={onNavigate}
        onNavigateTo={onNavigateTo}
        onOpenControlPopover={onOpenControlPopover}
        onToggleSection={onToggleSection}
        openControlId={openControl?.id}
        pathname={pathname}
        t={t}
        visibleNavEntries={visibleNavEntries}
      />

      {!loginMode && AccountSlotComponent ? (
        <AccountSlotComponent collapsed={isCollapsed} mobile={mobile} onNavigate={onNavigate} />
      ) : null}

      <AppNavControlPopover
        control={openControl ? navControls?.[openControl.id] : undefined}
        mobile={mobile}
        onClose={onCloseControlPopover}
        openControl={openControl}
      />

      {!mobile ? (
        <AppNavResizeHandle
          isResizing={isResizing}
          navLocked={navLocked}
          onResizeStart={onResizeStart}
          onResizeDoubleClick={onResizeDoubleClick}
        />
      ) : null}
    </Box>
  );
}
