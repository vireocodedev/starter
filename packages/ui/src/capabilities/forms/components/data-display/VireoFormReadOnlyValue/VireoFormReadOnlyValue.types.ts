import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFormReadOnlyValueClasses,
  type VireoFormReadOnlyValueClassKey,
} from "./VireoFormReadOnlyValue.classes";
import type {
  VIREO_FORM_READ_ONLY_VALUE_NAME,
  VireoFormReadOnlyValueSlotName,
} from "./VireoFormReadOnlyValue.identity";

export type VireoFormReadOnlyValueOwnerState = {
  empty: boolean;
  hasLabel: boolean;
};

export interface VireoFormReadOnlyValueRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormReadOnlyValueLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormReadOnlyValueValueSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFormReadOnlyValue}. */
export type VireoFormReadOnlyValueSlots = {
  [TSlotName in VireoFormReadOnlyValueSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFormReadOnlyValue}. */
export type VireoFormReadOnlyValueSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormReadOnlyValueSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoFormReadOnlyValueRootSlotPropsOverrides, VireoFormReadOnlyValueOwnerState>;
    /** @default Typography */
    label: SlotProps<
      typeof Typography,
      VireoFormReadOnlyValueLabelSlotPropsOverrides,
      VireoFormReadOnlyValueOwnerState
    >;
    /** @default Typography */
    value: SlotProps<
      typeof Typography,
      VireoFormReadOnlyValueValueSlotPropsOverrides,
      VireoFormReadOnlyValueOwnerState
    >;
  }
>;

/** Props owned by {@link VireoFormReadOnlyValue}. */
export type VireoFormReadOnlyValueOwnProps = VireoFormReadOnlyValueSlotsAndSlotProps & {
  /** Value content rendered without editable control chrome. */
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormReadOnlyValueClasses>;
  /** Whether the bound field has no meaningful value. @default false */
  empty?: boolean;
  /** Content rendered when `empty` is true. @default 'Not provided' */
  emptyValue?: React.ReactNode;
  /** Optional visible field label. Required indicators are intentionally omitted in read-only presentation. */
  label?: React.ReactNode;
};

/** Props VireoFormReadOnlyValue inherits from its default root after excluding component-owned props. */
export type VireoFormReadOnlyValueInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoFormReadOnlyValue}. */
export type VireoFormReadOnlyValueProps = VireoFormReadOnlyValueOwnProps & VireoFormReadOnlyValueInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_READ_ONLY_VALUE_NAME]?: VireoThemeComponent<
      VireoFormReadOnlyValueProps,
      VireoFormReadOnlyValueClassKey,
      VireoFormReadOnlyValueOwnerState,
      Theme
    >;
  }
}
