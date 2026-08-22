import { type AppPermissionScope } from "@/config/app.config.types";
import { useAppShellContext } from "@/shell/useAppShellContext";

/**
 * The app's permission checker, as supplied to `AppShellProvider`.
 *
 * @example
 *   const { canAccess } = useAppPermissions();
 *   const editable = canAccess("area:edit", { companyId: area.companyId });
 */
export function useAppPermissions() {
  const {
    runtime: { permissions },
  } = useAppShellContext();

  return permissions;
}

/**
 * Resolves a single permission, optionally within a scope.
 *
 * Scopes that vary per record — the tenant that owns a row, the shift a user is
 * currently on — can only be known at the call site, which is why this exists
 * alongside the static `permissionScope` on nav entries and route handles.
 *
 * @example
 *   {useAppCan("lockage:finalize", { shiftId }) && <FinalizeButton />}
 */
export function useAppCan(permission: string | undefined, scope?: AppPermissionScope): boolean {
  const { canAccess } = useAppPermissions();

  return canAccess(permission, scope);
}
