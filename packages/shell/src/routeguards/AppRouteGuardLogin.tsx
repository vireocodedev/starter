import { AppAuthTransitionScreen } from "@/shell/AppAuthTransitionScreen";
import { useAppShellContext } from "@/shell/useAppShellContext";
import { Navigate, Outlet, useLocation } from "react-router";
import { resolvePostLoginPath } from "./authRedirect";

export function AppRouteGuardLogin() {
  const {
    runtime: {
      auth: { authenticatedPath, isAuthenticated, isLoading },
    },
  } = useAppShellContext();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={resolvePostLoginPath(location.state, authenticatedPath)} replace />;
  }
  if (isLoading) return <AppAuthTransitionScreen fullscreen={false} />;

  return <Outlet />;
}
