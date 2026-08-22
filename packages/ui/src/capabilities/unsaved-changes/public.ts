export {
  UnsavedChangesContext,
  UnsavedChangesScopeContext,
  createUnsavedChangesRegistry,
  getUnsavedChangesStatus,
  isUnsavedChangesRegistrationInScope,
  useUnsavedChanges,
  useUnsavedChangesScopeId,
  type UnsavedChangesContextValue,
  type UnsavedChangesDiscardRequest,
  type UnsavedChangesRegistration,
  type UnsavedChangesRegistry,
  type UnsavedChangesScopeId,
  type UnsavedChangesStatus,
} from "./contexts/UnsavedChangesContext/UnsavedChangesContext";
export {
  useUnsavedChangesRegistration,
  type UseUnsavedChangesRegistrationProps,
} from "./hooks/useUnsavedChangesRegistration/useUnsavedChangesRegistration";
export {
  useUnsavedChangesRequestDiscard,
  type UseUnsavedChangesRequestDiscardOptions,
} from "./hooks/useUnsavedChangesRequestDiscard/useUnsavedChangesRequestDiscard";
export {
  UnsavedChangesScope,
  type UnsavedChangesScopeProps,
} from "./providers/UnsavedChangesScope/UnsavedChangesScope";
