import { type AppConfigTranslationFn } from "@/config/app.config.types";

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
    canAccess: (permission: string | undefined) => boolean;
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
