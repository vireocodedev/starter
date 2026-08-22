import type React from "react";

/** Wraps already-composed children with one configured provider. */
export type VireoProviderWrapper = (children: React.ReactNode) => React.ReactElement;

export type VireoProviderComposerProps = {
  children: React.ReactNode;
  /** Provider wrappers ordered from outermost to innermost. */
  providers: readonly VireoProviderWrapper[];
};
