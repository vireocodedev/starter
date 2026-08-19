import { UnsavedChangesScopeContext, useUnsavedChangesScopeId } from "@/capabilities/unsaved-changes/public";
import React from "react";

export type UnsavedChangesScopeProps = {
  children: React.ReactNode;
  id?: string;
};

function normalizeReactId(id: string): string {
  return id.replaceAll(":", "");
}

export function UnsavedChangesScope({ children, id }: UnsavedChangesScopeProps) {
  const parentScopeId = useUnsavedChangesScopeId();
  const reactId = React.useId();
  const segment = id ?? `scope-${normalizeReactId(reactId)}`;
  const scopeId = parentScopeId ? `${parentScopeId}/${segment}` : segment;

  return <UnsavedChangesScopeContext.Provider value={scopeId}>{children}</UnsavedChangesScopeContext.Provider>;
}
