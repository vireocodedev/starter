import {
  type AppConfigPermission,
  type AppConfigTranslationFn,
  type AppPageConfig,
  type AppPageDefinition,
} from "@/config/app.config.types";
import { defineRouteNodeMetadata } from "@/sitemap/routeMetadata";
import { type StrictConfigRecord } from "@/sitemap/strictConfig.types";

type AppPageRecord<
  TPages extends Record<string, AppPageDefinition<TPermission, TTranslationFn>>,
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  readonly [K in keyof TPages]: AppPageConfig<K & string, TPages[K]["routePath"], TPermission, TTranslationFn> &
    TPages[K];
};

export function definePages<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
  const TPages extends Record<string, AppPageDefinition<TPermission, TTranslationFn>> = Record<
    string,
    AppPageDefinition<TPermission, TTranslationFn>
  >,
>(
  pages: StrictConfigRecord<TPages, AppPageDefinition<TPermission, TTranslationFn>>,
): AppPageRecord<TPages, TPermission, TTranslationFn> {
  return Object.fromEntries(
    Object.entries(pages).map(([key, page]) => [key, defineRouteNodeMetadata(page, "page", key)]),
  ) as AppPageRecord<TPages, TPermission, TTranslationFn>;
}
