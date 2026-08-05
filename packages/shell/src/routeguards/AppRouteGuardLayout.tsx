import { type AppRouteHandle } from "@/config/app.config.routes.types";
import { AppAuthTransitionScreen } from "@/shell/AppAuthTransitionScreen";
import { useAppShellContext } from "@/shell/useAppShellContext";
import { Navigate, Outlet, useLocation, useMatches } from "react-router";
import { createAuthRedirectState } from "./authRedirect";

type RequiredPermission = {
  permission: string;
  scope?: Record<string, unknown>;
};

function toRequiredPermission(handle: AppRouteHandle | undefined): RequiredPermission | null {
  if (handle?.permission == null) return null;
  return { permission: handle.permission, scope: handle.permissionScope };
}

function isRequiredPermission(value: RequiredPermission | null): value is RequiredPermission {
  return value !== null;
}

export function AppRouteGuardLayout() {
  const {
    runtime: {
      auth: { isAuthenticated, isLoading, isAuthTransitioning, loginPath, role, unauthorizedPath },
      permissions,
    },
  } = useAppShellContext();
  const location = useLocation();
  const matches = useMatches();
  const requiredPermissions = matches
    .map(match => toRequiredPermission(match.handle as AppRouteHandle | undefined))
    .filter(isRequiredPermission);

  if (isLoading || isAuthTransitioning) return <AppAuthTransitionScreen fullscreen={false} />;
  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={createAuthRedirectState(location, loginPath)} />;
  }

  if (requiredPermissions.length > 0 && role == null) {
    return <AppAuthTransitionScreen fullscreen={false} />;
  }

  if (!requiredPermissions.every(({ permission, scope }) => permissions.canAccess(permission, scope))) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return <Outlet />;
}
