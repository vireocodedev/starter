import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type { AnyHistoryDefinition, HistoryDefinition } from "@vireocodedev/starter-history";
import type React from "react";
import { type VireoHistoryEntryClasses, type VireoHistoryEntryClassKey } from "./VireoHistoryEntry.classes";
import type { VIREO_HISTORY_ENTRY_NAME, VireoHistoryEntrySlotName } from "./VireoHistoryEntry.identity";

export type VireoHistoryEntryLabels = {
  expandSection: string;
  collapseSection: string;
  showUnchanged: string;
  hideUnchanged: string;
  showMore: string;
  showLess: string;
  added: string;
  removed: string;
  updated: string;
  moved: string;
  unchanged: string;
  field: string;
  previous: string;
  current: string;
  value: string;
  changes: (count: number) => React.ReactNode;
};

export type VireoHistoryEntryOwnerState = {
  defaultExpandedDepth: number;
  defaultShowUnchanged: boolean;
  expanded: boolean;
  hasUnchanged: boolean;
  hasRootMeta: boolean;
  showRootEntityLabel: boolean;
};

export interface VireoHistoryEntryRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoHistoryEntry}. */
export type VireoHistoryEntrySlots = {
  [TSlotName in VireoHistoryEntrySlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoHistoryEntry}. */
export type VireoHistoryEntrySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoHistoryEntrySlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoHistoryEntryRootSlotPropsOverrides, VireoHistoryEntryOwnerState>;
  }
>;

/** Props owned by {@link VireoHistoryEntry}. */
export type VireoHistoryEntrySnapshot<TDefinition extends AnyHistoryDefinition> =
  TDefinition extends HistoryDefinition<infer TEntity> ? TEntity : unknown;

export type VireoHistoryEntryOwnProps<TDefinition extends AnyHistoryDefinition = AnyHistoryDefinition> =
  VireoHistoryEntrySlotsAndSlotProps & {
    /** Typed history definition used to validate, render, and diff both snapshots. */
    definition: TDefinition;
    /** Snapshot before the recorded change. Use `null` for a newly added entity. */
    previous: VireoHistoryEntrySnapshot<TDefinition> | null;
    /** Snapshot after the recorded change. Use `null` for a removed entity. */
    current: VireoHistoryEntrySnapshot<TDefinition> | null;
    /** Content rendered for nullish or otherwise empty field values. */
    emptyValue?: React.ReactNode;
    /** Metadata displayed beside the root expansion control. */
    rootMeta?: React.ReactNode;
    /** Displays the root definition label and rendered entity identity. @default true */
    showRootEntityLabel?: boolean;
    /** Initially includes unchanged fields in the rendered entry. @default false */
    defaultShowUnchanged?: boolean;
    /** Deepest group level expanded initially. The root group is depth 1. @default 3 */
    defaultExpandedDepth?: number;
    /** Override the default English interaction and accessibility labels. */
    labels?: Partial<VireoHistoryEntryLabels>;
    /** Override or extend the utility classes applied to each slot. */
    classes?: Partial<VireoHistoryEntryClasses>;
  };

/** Props VireoHistoryEntry inherits from its default root after excluding component-owned props. */
export type VireoHistoryEntryInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoHistoryEntry}. */
export type VireoHistoryEntryProps<TDefinition extends AnyHistoryDefinition = AnyHistoryDefinition> =
  VireoHistoryEntryOwnProps<TDefinition> & VireoHistoryEntryInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_HISTORY_ENTRY_NAME]?: VireoThemeComponent<
      VireoHistoryEntryProps,
      VireoHistoryEntryClassKey,
      VireoHistoryEntryOwnerState,
      Theme
    >;
  }
}
