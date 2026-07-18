import { type AppSectionConfig, type AppSectionDefinition } from "@/config/app.config.types";
import { defineRouteNodeMetadata } from "@/sitemap/routeMetadata";
import { type StrictConfigRecord } from "@/sitemap/strictConfig.types";

type AppSectionRecord<TSections extends Record<string, AppSectionDefinition>> = {
  readonly [K in keyof TSections]: AppSectionConfig<K & string, TSections[K]["routePath"]> & TSections[K];
};

export function defineSections<const TSections extends Record<string, AppSectionDefinition>>(
  sections: StrictConfigRecord<TSections, AppSectionDefinition>,
): AppSectionRecord<TSections> {
  return Object.fromEntries(
    Object.entries(sections).map(([key, section]) => [key, defineRouteNodeMetadata(section, "section", key)]),
  ) as AppSectionRecord<TSections>;
}
