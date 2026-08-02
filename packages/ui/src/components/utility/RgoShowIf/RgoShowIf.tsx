import type React from "react";

export type RgoShowIfProps = {
  /**
   * Render `children` when this is `true` (or when the function returns `true`).
   * Render nothing otherwise.
   *
   * Pass a function only when the predicate is expensive and you want to defer it
   * until render time. For most cases (including hook-derived booleans like
   * `useCan(...)`), pass the boolean directly.
   */
  when: boolean | (() => boolean);
  children: React.ReactNode;
  /** Optional fallback rendered when `when` is falsy. */
  fallback?: React.ReactNode;
};

/**
 * Conditionally renders `children`. Use for permission gates, feature flags,
 * and any other "show this only if…" pattern that you want self-documenting at
 * the call site.
 *
 * @example
 *   <RgoShowIf when={useCan("vessel:viewHistory")}>
 *     <HistoryButton />
 *   </RgoShowIf>
 */
export function RgoShowIf({ when, children, fallback = null }: RgoShowIfProps) {
  const allowed = typeof when === "function" ? when() : when;
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
