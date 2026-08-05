import { type AppConfig, type AppMobileBottomNavItem } from "@/config/app.config.types";
import { useAppNavLayout } from "@/shell/layout/AppNavLayoutContext";
import { useAppShellContext } from "@/shell/useAppShellContext";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { RgoIcon } from "@vireocodedev/starter-ui";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import React from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router";

type MobileNavValue = string;
type MobileNavPathResolver = AppConfig["routes"]["getPath"];

function isPathInGroup(pathname: string, groupPath: string): boolean {
  return pathname === groupPath || pathname.startsWith(`${groupPath}/`);
}

function resolveMobileNavItemPath(item: AppMobileBottomNavItem, getPath: MobileNavPathResolver): string | undefined {
  return item.path ?? (item.page ? getPath(item.page) : undefined);
}

function findPathItem(
  pathname: string,
  items: AppMobileBottomNavItem[],
  getPath: MobileNavPathResolver,
): AppMobileBottomNavItem | undefined {
  return items.find(item => {
    const itemPath = resolveMobileNavItemPath(item, getPath);

    return itemPath ? isPathInGroup(pathname, itemPath) : false;
  });
}

function getActiveValue({
  pathname,
  config,
  canAccess,
  getPath,
}: {
  pathname: string;
  config: {
    authenticatedItems: AppMobileBottomNavItem[];
    loginItem: AppMobileBottomNavItem;
    moreItem: Omit<AppMobileBottomNavItem, "path" | "page">;
  };
  canAccess: (item: AppMobileBottomNavItem) => boolean;
  getPath: MobileNavPathResolver;
}): MobileNavValue {
  const { authenticatedItems, loginItem, moreItem } = config;
  const allowedAuthenticatedItems = authenticatedItems.filter(canAccess);
  const loginPath = resolveMobileNavItemPath(loginItem, getPath);

  if (loginPath && isPathInGroup(pathname, loginPath)) {
    return loginItem.value;
  }

  if (pathname === "/") {
    return (
      allowedAuthenticatedItems.find(item => resolveMobileNavItemPath(item, getPath) === "/")?.value ?? moreItem.value
    );
  }

  return findPathItem(pathname, allowedAuthenticatedItems, getPath)?.value ?? moreItem.value;
}

export function AppMobileBottomNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { openMobileNav } = useAppNavLayout();
  const { t: tPlatform } = usePlatformTranslation();
  const {
    config,
    runtime: {
      i18n: { t },
      navigation: { onBeforeNavigate },
      permissions: { canAccess },
    },
  } = useAppShellContext();
  const bottomNavigationLabel = tPlatform("common.bottomNavigation");
  const {
    shell: { mobileBottomNavigation },
    routes: { getPath },
  } = config;
  const { authenticatedItems, loginItem, moreItem } = mobileBottomNavigation;
  const bottomNavHeightPx = config.brand.navigation.bottomNavHeightPx;
  const loginPath = resolveMobileNavItemPath(loginItem, getPath);
  const loginMode = Boolean(loginPath && isPathInGroup(pathname, loginPath));
  const canAccessItem = React.useCallback((item: AppMobileBottomNavItem) => canAccess(item.permission), [canAccess]);
  const visibleItems = React.useMemo(
    () => (loginMode ? [loginItem] : authenticatedItems.filter(canAccessItem)),
    [authenticatedItems, canAccessItem, loginItem, loginMode],
  );

  const locationValue = React.useMemo(
    () => getActiveValue({ pathname, config: mobileBottomNavigation, canAccess: canAccessItem, getPath }),
    [canAccessItem, getPath, mobileBottomNavigation, pathname],
  );
  const [optimisticValue, setOptimisticValue] = React.useState<MobileNavValue | null>(null);
  const value = optimisticValue ?? locationValue;

  React.useEffect(() => {
    setOptimisticValue(null);
  }, [pathname]);

  const setOptimisticNavValue = React.useCallback((nextValue: MobileNavValue) => {
    flushSync(() => {
      setOptimisticValue(nextValue);
    });
  }, []);

  const navigateWithOptimisticValue = React.useCallback(
    (item: AppMobileBottomNavItem) => {
      const itemPath = resolveMobileNavItemPath(item, getPath);

      if (!itemPath) {
        return;
      }

      onBeforeNavigate();
      setOptimisticNavValue(item.value);
      navigate(itemPath);
    },
    [getPath, navigate, onBeforeNavigate, setOptimisticNavValue],
  );

  const onChange = (_event: React.SyntheticEvent, nextValue: MobileNavValue) => {
    if (nextValue === moreItem.value) {
      openMobileNav();
      return;
    }

    const nextItem = visibleItems.find(item => item.value === nextValue);
    if (nextItem) {
      navigateWithOptimisticValue(nextItem);
    }
  };

  return (
    <Paper
      component="nav"
      aria-label={bottomNavigationLabel}
      elevation={8}
      sx={theme => ({
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: "1px solid",
        borderTopColor: theme.palette.grey[300],
        borderRadius: 0,
        boxShadow: 0,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        backgroundColor: "background.paper",
        "& .MuiBottomNavigationAction-root": {
          fontSize: 12,

          "& .MuiSvgIcon-root": {
            fontSize: 24,
          },

          "& .MuiBottomNavigationAction-label": {
            fontSize: 12,
          },

          "&.Mui-selected": {
            "& .MuiSvgIcon-root": {
              fontSize: 24,
            },

            "& .MuiBottomNavigationAction-label": {
              fontSize: 12,
            },
          },
        },
      })}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={onChange}
        sx={{
          height: bottomNavHeightPx,
        }}
      >
        {visibleItems.map(item => (
          <BottomNavigationAction
            key={item.value}
            value={item.value}
            label={item.label(t)}
            icon={<RgoIcon icon={item.icon} width={18} height={18} />}
            onPointerDown={() => setOptimisticNavValue(item.value)}
          />
        ))}
        <BottomNavigationAction
          value={moreItem.value}
          label={moreItem.label(t)}
          icon={<RgoIcon icon={moreItem.icon} width={18} height={18} />}
        />
      </BottomNavigation>
    </Paper>
  );
}
