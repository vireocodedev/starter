import { type AppRouteHandle } from "@/config/app.config.routes.types";
import { AppAuthTransitionScreen } from "@/shell/AppAuthTransitionScreen";
import { useAppShellContext } from "@/shell/useAppShellContext";
import { Navigate, Outlet, useLocation, useMatches } from "react-router";
import { createAuthRedirectState } from "./authRedirect";

function isDefinedPermission(permission: string | undefined): permission is string {
  return permission != null;
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
    .map(match => (match.handle as AppRouteHandle | undefined)?.permission)
    .filter(isDefinedPermission);

  if (isLoading || isAuthTransitioning) return <AppAuthTransitionScreen fullscreen={false} />;
  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={createAuthRedirectState(location, loginPath)} />;
  }

  if (requiredPermissions.length > 0 && role == null) {
    return <AppAuthTransitionScreen fullscreen={false} />;
  }

  if (!requiredPermissions.every(permission => permissions.canAccess(permission))) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return <Outlet />;
}
