import { z } from "zod";
import type { ShellNavigationEntry } from "../navigation/shellNavigation";
import type { ShellPage, ShellPermission, ShellSitemap } from "../sitemap/shellSitemap.types";

export const ShellModeSchema = z.enum(["dashboard", "public", "bare"]);
export type ShellMode = z.infer<typeof ShellModeSchema>;

export type ShellConfig<TPermission extends ShellPermission = ShellPermission, TContext = unknown> = {
  mode: ShellMode;
  sitemap: ShellSitemap;
  entryPage: ShellPage<string, string, TPermission, TContext>;
  loginPage?: ShellPage<string, string, TPermission, TContext>;
  unauthorizedPage?: ShellPage<string, string, TPermission, TContext>;
  navigation?: {
    authenticated?: readonly ShellNavigationEntry<TPermission, TContext>[];
    public?: readonly ShellNavigationEntry<TPermission, TContext>[];
  };
};

export type ShellConfigValidationOptions<TPermission extends ShellPermission = ShellPermission> = {
  permissions?: ReadonlySet<TPermission> | readonly TPermission[] | Readonly<Record<TPermission, unknown>>;
};

function hasPermission<TPermission extends ShellPermission>(
  permission: TPermission,
  registry: ShellConfigValidationOptions<TPermission>["permissions"],
): boolean {
  if (!registry) return true;
  if (registry instanceof Set) return registry.has(permission);
  if (Array.isArray(registry)) return registry.includes(permission);
  return Object.prototype.hasOwnProperty.call(registry, permission);
}

export function defineShellConfig<TPermission extends ShellPermission = ShellPermission, TContext = unknown>(
  config: ShellConfig<TPermission, TContext>,
  options: ShellConfigValidationOptions<TPermission> = {},
): ShellConfig<TPermission, TContext> {
  const issues: z.ZodIssue[] = [];
  ShellModeSchema.parse(config.mode);

  const assertMountedPage = (page: { key: string } | undefined, path: (string | number)[]) => {
    if (!page) return;
    const route = config.sitemap.getRoute(page.key);
    if (route?.kind !== "page") {
      issues.push({
        code: z.ZodIssueCode.custom,
        path,
        message: `Page "${page.key}" is not mounted in the sitemap.`,
      });
    }
  };

  assertMountedPage(config.entryPage, ["entryPage"]);
  assertMountedPage(config.loginPage, ["loginPage"]);
  assertMountedPage(config.unauthorizedPage, ["unauthorizedPage"]);

  Object.entries(config.navigation ?? {}).forEach(([group, entries]) => {
    const seenIds = new Set<string>();
    entries?.forEach((entry, index) => {
      if (entry.type === "item") assertMountedPage(entry.page, ["navigation", group, index, "page"]);
      if (entry.type === "heading" || entry.type === "action") {
        if (seenIds.has(entry.id)) {
          issues.push({
            code: z.ZodIssueCode.custom,
            path: ["navigation", group, index, "id"],
            message: `Duplicate navigation id "${entry.id}".`,
          });
        }
        seenIds.add(entry.id);
      }
      if ("permission" in entry && entry.permission && !hasPermission(entry.permission, options.permissions)) {
        issues.push({
          code: z.ZodIssueCode.custom,
          path: ["navigation", group, index, "permission"],
          message: `Unknown permission "${entry.permission}".`,
        });
      }
    });
  });

  config.sitemap.routes.forEach((route, index) => {
    const permission = route.node.permission as TPermission | undefined;
    if (permission && !hasPermission(permission, options.permissions)) {
      issues.push({
        code: z.ZodIssueCode.custom,
        path: ["sitemap", "routes", index, "permission"],
        message: `Unknown permission "${permission}".`,
      });
    }
  });

  if (issues.length > 0) throw new z.ZodError(issues);
  return Object.freeze(config);
}
