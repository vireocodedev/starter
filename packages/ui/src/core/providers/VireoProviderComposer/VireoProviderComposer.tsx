import type { VireoProviderComposerProps } from "./VireoProviderComposer.types";

/** Composes configured provider wrappers from outermost to innermost without obscuring their props. */
export function VireoProviderComposer({ children, providers }: VireoProviderComposerProps) {
  return <>{providers.reduceRight((nestedChildren, wrap) => wrap(nestedChildren), children)}</>;
}

export type { VireoProviderComposerProps, VireoProviderWrapper } from "./VireoProviderComposer.types";
