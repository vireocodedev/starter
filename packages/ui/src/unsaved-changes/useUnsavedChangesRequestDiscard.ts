import {
  useUnsavedChanges,
  useUnsavedChangesScopeId,
  type UnsavedChangesScopeId,
} from "@/capabilities/unsaved-changes/public";
import React from "react";

export type UseUnsavedChangesRequestDiscardOptions = {
  disabled?: boolean;
  scopeId?: UnsavedChangesScopeId;
};

export function useUnsavedChangesRequestDiscard(
  onDiscard: () => void | Promise<void>,
  { disabled = false, scopeId: requestedScopeId }: UseUnsavedChangesRequestDiscardOptions = {},
): () => void {
  const currentScopeId = useUnsavedChangesScopeId();
  const { requestDiscard } = useUnsavedChanges();
  const scopeId = requestedScopeId === undefined ? currentScopeId : requestedScopeId;

  return React.useCallback(() => {
    if (disabled) {
      return;
    }

    requestDiscard({ scopeId, onDiscard });
  }, [disabled, onDiscard, requestDiscard, scopeId]);
}
