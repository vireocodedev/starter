import { type AppRouteObject } from "@/config/app.config.routes.types";
import {
  type AppConfig,
  type AppConfigPermission,
  type AppConfigTranslationFn,
  type AppPageConfig,
  type AppShellNavEntry,
} from "@/config/app.config.types";

type ValidationIssue = {
  path: string;
  message: string;
};

type AppPermissionRegistry<TPermission extends AppConfigPermission = AppConfigPermission> =
  ReadonlySet<TPermission> | readonly TPermission[] | Record<TPermission, unknown>;

export type AppConfigValidationOptions<TPermission extends AppConfigPermission = AppConfigPermission> = {
  permissions?: AppPermissionRegistry<TPermission>;
};

function isPermissionKey<TPermission extends AppConfigPermission>(
  permission: string,
  registry: AppPermissionRegistry<TPermission> | undefined,
): boolean {
  if (!registry) {
    return true;
  }

  if (registry instanceof Set) {
    return registry.has(permission as TPermission);
  }

  if (Array.isArray(registry)) {
    return registry.includes(permission as TPermission);
  }

  return Object.prototype.hasOwnProperty.call(registry, permission);
}

function addDuplicateIssues(values: string[], path: string, issues: ValidationIssue[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach(value => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  duplicates.forEach(value => {
    issues.push({
      path,
      message: `Duplicate value "${value}".`,
    });
  });
}

function validatePermission<TPermission extends AppConfigPermission>(
  permission: TPermission | undefined,
  path: string,
  issues: ValidationIssue[],
  options: AppConfigValidationOptions<TPermission>,
): void {
  if (!permission || isPermissionKey(permission, options.permissions)) {
    return;
  }

  issues.push({
    path,
    message: `Unknown permission "${permission}". Add it to the configured permission registry or remove it from config.`,
  });
}

function validateRoutePermissions<TPermission extends AppConfigPermission, TTranslationFn>(
  routes: AppRouteObject<TPermission, TTranslationFn>[],
  path: string,
  issues: ValidationIssue[],
  options: AppConfigValidationOptions<TPermission>,
): void {
  routes.forEach((route, index) => {
    validatePermission(route.handle?.permission, `${path}[${index}].handle.permission`, issues, options);

    if (route.children) {
      validateRoutePermissions(route.children, `${path}[${index}].children`, issues, options);
    }
  });
}

function validatePageNavigationPath<TPermission extends AppConfigPermission, TTranslationFn>({
  page,
  path,
  config,
  issues,
}: {
  page: AppPageConfig<string, string, TPermission, TTranslationFn> | undefined;
  path: string;
  config: AppConfig<TPermission, TTranslationFn>;
  issues: ValidationIssue[];
}): void {
  if (!page) {
    return;
  }

  try {
    config.routes.getPath(page);
  } catch (error) {
    issues.push({
      path,
      message: error instanceof Error ? error.message : "Could not resolve page path from route config.",
    });
  }
}

function validateNavEntries<TPermission extends AppConfigPermission, TTranslationFn>({
  entries,
  path,
  config,
  issues,
  options,
}: {
  entries: AppShellNavEntry<TPermission, TTranslationFn>[];
  path: string;
  config: AppConfig<TPermission, TTranslationFn>;
  issues: ValidationIssue[];
  options: AppConfigValidationOptions<TPermission>;
}): void {
  const entryIds: string[] = [];

  entries.forEach((entry, index) => {
    if (entry.type === "item") {
      validatePermission(entry.permission, `${path}[${index}].permission`, issues, options);
      validatePageNavigationPath({ page: entry.page, path: `${path}[${index}].page`, config, issues });
    }

    if (entry.type === "slot") {
      entryIds.push(entry.id);
      validatePermission(entry.permission, `${path}[${index}].permission`, issues, options);

      if (!config.shell.navSlots?.[entry.id]) {
        issues.push({
          path: `${path}[${index}]`,
          message: `Missing nav slot component for slot id "${entry.id}".`,
        });
      }
    }

    if (entry.type === "control") {
      entryIds.push(entry.id);
      validatePermission(entry.permission, `${path}[${index}].permission`, issues, options);

      if (!config.shell.navControls?.[entry.id]) {
        issues.push({
          path: `${path}[${index}]`,
          message: `Missing nav control config for control id "${entry.id}".`,
        });
      }
    }

    if (entry.type === "separator") {
      entryIds.push(entry.id);
    }
  });

  addDuplicateIssues(entryIds, `${path}.id`, issues);
}

export function validateAppConfig<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
>(config: AppConfig<TPermission, TTranslationFn>, options: AppConfigValidationOptions<TPermission> = {}): void {
  const issues: ValidationIssue[] = [];
  const allowedShellModes: AppConfig<TPermission, TTranslationFn>["shell"]["mode"][] = ["dashboard", "public", "bare"];

  if (!allowedShellModes.includes(config.shell.mode)) {
    issues.push({
      path: "shell.mode",
      message: `Unsupported shell mode "${config.shell.mode}".`,
    });
  }

  validateRoutePermissions([config.routes.login], "routes.login", issues, options);
  validateRoutePermissions(config.routes.authenticated, "routes.authenticated", issues, options);
  validatePageNavigationPath({ page: config.routes.loginPage, path: "routes.loginPage", config, issues });
  validatePageNavigationPath({
    page: config.routes.authenticatedEntryPage,
    path: "routes.authenticatedEntryPage",
    config,
    issues,
  });
  validatePageNavigationPath({ page: config.routes.unauthorizedPage, path: "routes.unauthorizedPage", config, issues });

  validateNavEntries({ entries: config.shell.loginNavEntries, path: "shell.loginNavEntries", config, issues, options });
  validateNavEntries({ entries: config.shell.navEntries, path: "shell.navEntries", config, issues, options });

  if (config.shell.publicNavEntries) {
    validateNavEntries({
      entries: config.shell.publicNavEntries,
      path: "shell.publicNavEntries",
      config,
      issues,
      options,
    });
  }

  Object.entries(config.shell.navControls ?? {}).forEach(([controlId, control]) => {
    validatePermission(control.permission, `shell.navControls.${controlId}.permission`, issues, options);
  });

  const mobileItems = config.shell.mobileBottomNavigation.authenticatedItems;
  mobileItems.forEach((item, index) => {
    validatePermission(
      item.permission,
      `shell.mobileBottomNavigation.authenticatedItems[${index}].permission`,
      issues,
      options,
    );
    validatePageNavigationPath({
      page: item.page,
      path: `shell.mobileBottomNavigation.authenticatedItems[${index}].page`,
      config,
      issues,
    });
  });

  validatePermission(
    config.shell.mobileBottomNavigation.loginItem.permission,
    "shell.mobileBottomNavigation.loginItem.permission",
    issues,
    options,
  );
  validatePageNavigationPath({
    page: config.shell.mobileBottomNavigation.loginItem.page,
    path: "shell.mobileBottomNavigation.loginItem.page",
    config,
    issues,
  });

  addDuplicateIssues(
    mobileItems.map(item => item.value),
    "shell.mobileBottomNavigation.authenticatedItems.value",
    issues,
  );

  if (issues.length === 0) {
    return;
  }

  throw new Error(
    ["APP_CONFIG validation failed:", ...issues.map(issue => `- ${issue.path}: ${issue.message}`)].join("\n"),
  );
}
