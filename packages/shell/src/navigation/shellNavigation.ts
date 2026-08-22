import { z } from "zod";
import type { ShellLabel, ShellPage, ShellPermission, ShellPermissionScope } from "../sitemap/shellSitemap.types";

export const ShellNavigationIdSchema = z.string().trim().min(1, "Navigation identifiers cannot be blank.");

export type ShellNavigationEntry<TPermission extends ShellPermission = ShellPermission, TContext = unknown> =
  | {
      type: "item";
      page: ShellPage<string, string, TPermission, TContext>;
      label?: ShellLabel<TContext>;
      icon?: string;
      disabled?: boolean;
      disabledReason?: ShellLabel<TContext>;
      permission?: TPermission;
      permissionScope?: ShellPermissionScope;
    }
  | { type: "heading"; id: string; label: ShellLabel<TContext> }
  | { type: "action"; id: string; label: ShellLabel<TContext>; icon?: string; permission?: TPermission }
  | { type: "divider" };

export const shellNavigation = {
  item<TPermission extends ShellPermission = ShellPermission, TContext = unknown>(
    page: ShellPage<string, string, TPermission, TContext>,
    overrides: Omit<ShellNavigationEntry<TPermission, TContext> & { type: "item" }, "page" | "type"> = {},
  ): ShellNavigationEntry<TPermission, TContext> {
    return { type: "item", page, ...overrides };
  },
  heading<TContext = unknown>(
    id: string,
    label: ShellLabel<TContext>,
  ): ShellNavigationEntry<ShellPermission, TContext> {
    return { type: "heading", id: ShellNavigationIdSchema.parse(id), label };
  },
  action<TPermission extends ShellPermission = ShellPermission, TContext = unknown>(
    id: string,
    label: ShellLabel<TContext>,
    options: { icon?: string; permission?: TPermission } = {},
  ): ShellNavigationEntry<TPermission, TContext> {
    return { type: "action", id: ShellNavigationIdSchema.parse(id), label, ...options };
  },
  divider(): ShellNavigationEntry {
    return { type: "divider" };
  },
};
