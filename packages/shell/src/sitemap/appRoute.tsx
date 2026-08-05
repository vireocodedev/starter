import { type AppRouteObject } from "@/config/app.config.routes.types";
import { type AppPageConfig } from "@/config/app.config.types";
import { createPageRoute } from "@/sitemap/defineRoutes";
import type React from "react";

export const appRoute = {
  guardedPage({ page, GuardComponent }: { page: AppPageConfig; GuardComponent: React.ComponentType }): AppRouteObject {
    return {
      path: page.routePath,
      Component: GuardComponent,
      children: [
        {
          ...createPageRoute(page),
          path: "",
        },
      ],
    };
  },
};
