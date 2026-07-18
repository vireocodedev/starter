import { type AppPageConfig, type AppPageDefinition } from "@/config/app.config.types";
import { defineRouteNodeMetadata } from "@/sitemap/routeMetadata";
import { type StrictConfigRecord } from "@/sitemap/strictConfig.types";

type AppPageRecord<TPages extends Record<string, AppPageDefinition>> = {
  readonly [K in keyof TPages]: AppPageConfig<K & string, TPages[K]["routePath"]> & TPages[K];
};

export function definePages<const TPages extends Record<string, AppPageDefinition>>(
  pages: StrictConfigRecord<TPages, AppPageDefinition>,
): AppPageRecord<TPages> {
  return Object.fromEntries(
    Object.entries(pages).map(([key, page]) => [key, defineRouteNodeMetadata(page, "page", key)]),
  ) as AppPageRecord<TPages>;
}
