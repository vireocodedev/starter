import { useUnsavedChanges, useUnsavedChangesScopeId } from "@/capabilities/unsaved-changes/public";
import React from "react";

export type UseUnsavedChangesRegistrationProps = {
  busy?: boolean;
  dirty: boolean;
  enabled?: boolean;
  scopeId?: string;
};

export function useUnsavedChangesRegistration({
  busy = false,
  dirty,
  enabled = true,
  scopeId: explicitScopeId,
}: UseUnsavedChangesRegistrationProps) {
  const id = React.useId();
  const inheritedScopeId = useUnsavedChangesScopeId();
  const { removeRegistration, upsertRegistration } = useUnsavedChanges();
  const scopeId = explicitScopeId ?? inheritedScopeId;

  React.useLayoutEffect(() => {
    if (!enabled) {
      removeRegistration(id);
      return;
    }

    upsertRegistration({ id, scopeId, dirty, busy });
  }, [busy, dirty, enabled, id, removeRegistration, scopeId, upsertRegistration]);

  React.useLayoutEffect(() => () => removeRegistration(id), [id, removeRegistration]);
}
