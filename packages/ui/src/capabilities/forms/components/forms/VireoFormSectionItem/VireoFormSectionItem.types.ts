import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormSectionItemClasses, type VireoFormSectionItemClassKey } from "./VireoFormSectionItem.classes";
import type { VIREO_FORM_SECTION_ITEM_NAME, VireoFormSectionItemSlotName } from "./VireoFormSectionItem.identity";

export type VireoFormSectionItemSpan = "auto" | "full";

export type VireoFormSectionItemOwnerState = {
  span: VireoFormSectionItemSpan;
};

export interface VireoFormSectionItemRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFormSectionItem}. */
export type VireoFormSectionItemSlots = {
  [TSlotName in VireoFormSectionItemSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFormSectionItem}. */
export type VireoFormSectionItemSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSectionItemSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoFormSectionItemRootSlotPropsOverrides, VireoFormSectionItemOwnerState>;
  }
>;

/** Props owned by {@link VireoFormSectionItem}. */
export type VireoFormSectionItemOwnProps = VireoFormSectionItemSlotsAndSlotProps & {
  children: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormSectionItemClasses>;
  /** Controls whether the item occupies one cell or the complete responsive row. @default 'auto' */
  span?: VireoFormSectionItemSpan;
};

/** Props VireoFormSectionItem inherits from its default root after excluding component-owned props. */
export type VireoFormSectionItemInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoFormSectionItem}. */
export type VireoFormSectionItemProps = VireoFormSectionItemOwnProps & VireoFormSectionItemInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_SECTION_ITEM_NAME]?: VireoThemeComponent<
      VireoFormSectionItemProps,
      VireoFormSectionItemClassKey,
      VireoFormSectionItemOwnerState,
      Theme
    >;
  }
}
