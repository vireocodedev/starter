import {
  type AppConfigPermission,
  type AppConfigTranslationFn,
  type AppSectionConfig,
  type AppSectionDefinition,
} from "@/config/app.config.types";
import { defineRouteNodeMetadata } from "@/sitemap/routeMetadata";
import { type StrictConfigRecord } from "@/sitemap/strictConfig.types";

type AppSectionRecord<
  TSections extends Record<string, AppSectionDefinition<TPermission, TTranslationFn>>,
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
> = {
  readonly [K in keyof TSections]: AppSectionConfig<
    K & string,
    TSections[K]["routePath"],
    TPermission,
    TTranslationFn
  > &
    TSections[K];
};

export function defineSections<
  TPermission extends AppConfigPermission = AppConfigPermission,
  TTranslationFn = AppConfigTranslationFn,
  const TSections extends Record<string, AppSectionDefinition<TPermission, TTranslationFn>> = Record<
    string,
    AppSectionDefinition<TPermission, TTranslationFn>
  >,
>(
  sections: StrictConfigRecord<TSections, AppSectionDefinition<TPermission, TTranslationFn>>,
): AppSectionRecord<TSections, TPermission, TTranslationFn> {
  return Object.fromEntries(
    Object.entries(sections).map(([key, section]) => [key, defineRouteNodeMetadata(section, "section", key)]),
  ) as AppSectionRecord<TSections, TPermission, TTranslationFn>;
}
