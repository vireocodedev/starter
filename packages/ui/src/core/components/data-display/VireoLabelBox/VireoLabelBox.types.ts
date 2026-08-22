import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps, Theme, TypographyProps } from "@mui/material";
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoLabelBoxClasses, type VireoLabelBoxClassKey } from "./VireoLabelBox.classes";
import type { VIREO_LABEL_BOX_NAME, VireoLabelBoxSlotName } from "./VireoLabelBox.identity";

/** Supported layout directions for the label anatomy and its content. */
export type VireoLabelBoxDirection = "column" | "row";

/** A fixed label color or a theme-aware color resolver. */
export type VireoLabelBoxColor = string | ((theme: Theme) => string);

export type VireoLabelBoxOwnerState = {
  direction: VireoLabelBoxDirection;
  color: VireoLabelBoxColor;
  fontWeight: NonNullable<TypographyProps["fontWeight"]>;
  required: boolean;
  hasLabel: boolean;
  hasHelperText: boolean;
  hasHeader: boolean;
};

export interface VireoLabelBoxRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabelBoxHeaderSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabelBoxLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabelBoxRequiredIndicatorSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabelBoxHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabelBoxContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoLabelBox}. */
export type VireoLabelBoxSlots = {
  [TSlotName in VireoLabelBoxSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoLabelBox}. */
export type VireoLabelBoxSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoLabelBoxSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoLabelBoxRootSlotPropsOverrides, VireoLabelBoxOwnerState>;
    /** @default 'div' */
    header: SlotProps<"div", VireoLabelBoxHeaderSlotPropsOverrides, VireoLabelBoxOwnerState>;
    /** @default 'span' */
    label: SlotProps<"span", VireoLabelBoxLabelSlotPropsOverrides, VireoLabelBoxOwnerState>;
    /** @default 'span' */
    requiredIndicator: SlotProps<"span", VireoLabelBoxRequiredIndicatorSlotPropsOverrides, VireoLabelBoxOwnerState>;
    /** @default 'span' */
    helperText: SlotProps<"span", VireoLabelBoxHelperTextSlotPropsOverrides, VireoLabelBoxOwnerState>;
    /** @default 'div' */
    content: SlotProps<"div", VireoLabelBoxContentSlotPropsOverrides, VireoLabelBoxOwnerState>;
  }
>;

/** Props owned by {@link VireoLabelBox}. */
export type VireoLabelBoxOwnProps = VireoLabelBoxSlotsAndSlotProps & {
  /** Content laid out beneath or beside the label anatomy. */
  children: React.ReactNode;
  /** Optional visible label content. */
  label?: React.ReactNode;
  /** Optional supporting content aligned opposite the label. */
  helperText?: React.ReactNode;
  /** Color applied to the visible label and required indicator. @default theme.palette.text.primary */
  color?: VireoLabelBoxColor;
  /** Shows a visual required indicator after the label. @default false */
  required?: boolean;
  /** Font weight applied to the label header. @default 600 */
  fontWeight?: TypographyProps["fontWeight"];
  /** Lays out the label anatomy above or beside its content. @default 'column' */
  direction?: VireoLabelBoxDirection;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoLabelBoxClasses>;
};

/** Props VireoLabelBox inherits from its default root after excluding component-owned props. */
export type VireoLabelBoxInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "color" | "component" | "direction" | "required"
>;

/** Props accepted by {@link VireoLabelBox}. */
export type VireoLabelBoxProps = VireoLabelBoxOwnProps & VireoLabelBoxInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_LABEL_BOX_NAME]?: VireoThemeComponent<
      VireoLabelBoxProps,
      VireoLabelBoxClassKey,
      VireoLabelBoxOwnerState,
      Theme
    >;
  }
}
