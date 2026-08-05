import { type AppConfigTranslationFn, type AppPermissionScope } from "@/config/app.config.types";

export type AppShellPageBodyMaxWidth = false | "xs" | "sm" | "md" | "lg" | "xl";

export type AppShellRuntime = {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthTransitioning: boolean;
    username: string | null;
    role: unknown | null;
    loginPath: string;
    authenticatedPath: string;
    unauthorizedPath: string;
    expireSession: () => void;
    logout: () => Promise<void>;
  };
  permissions: {
    /**
     * Answers whether the current user holds `permission`.
     *
     * `scope` narrows the question to a particular context — a shift, a tenant,
     * a site. Implementations that do not need it can ignore the argument
     * entirely; a plain `(permission) => boolean` remains assignable here.
     */
    canAccess: (permission: string | undefined, scope?: AppPermissionScope) => boolean;
  };
  preferences: {
    navCollapsed: boolean;
    navLocked: boolean;
    navWidth: number;
    pageBodyMaxWidth: AppShellPageBodyMaxWidth;
    setNavCollapsed: (collapsed: boolean) => void;
    setNavWidth: (width: number) => void;
  };
  i18n: {
    t: AppConfigTranslationFn;
  };
  navigation: {
    onBeforeNavigate: () => void;
  };
};
