import { type AppConfigTranslationFn, type AppShellNavEntry } from "@/config/app.config.types";
import { type VireoIcon } from "@vireocodedev/starter-ui";
import type React from "react";

export type NavEntry = AppShellNavEntry;
export type NavItemEntry = Extract<NavEntry, { type: "item" }>;
export type NavControlEntry = Extract<NavEntry, { type: "control" }>;
export type NavSlotEntry = Extract<NavEntry, { type: "slot" }>;
export type NavSeparatorEntry = Extract<NavEntry, { type: "separator" }>;
export type NavIconName = React.ComponentProps<typeof VireoIcon>["icon"];
export type NavTranslationFn = AppConfigTranslationFn;
