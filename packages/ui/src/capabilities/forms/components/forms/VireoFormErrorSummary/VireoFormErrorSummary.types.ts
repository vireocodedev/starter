import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Alert, AlertProps, Box, ButtonBase, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoFormErrorSummaryClasses, VireoFormErrorSummaryClassKey } from "./VireoFormErrorSummary.classes";
import type { VIREO_FORM_ERROR_SUMMARY_NAME, VireoFormErrorSummarySlotName } from "./VireoFormErrorSummary.identity";

export type VireoFormErrorSummaryScope = "form" | "all";
export type VireoFormErrorSummaryLocaleText = {
  title: (context: { count: number }) => string;
  formGroupLabel: string;
  otherGroupLabel: string;
  navigateToError: (context: { message: string }) => string;
};
export const defaultVireoFormErrorSummaryLocaleText: VireoFormErrorSummaryLocaleText = {
  title: ({ count }) => (count === 1 ? "1 error needs attention" : `${count} errors need attention`),
  formGroupLabel: "Form",
  otherGroupLabel: "Other",
  navigateToError: ({ message }) => `Go to error: ${message}`,
};

export type VireoFormErrorSummaryOwnerState = { errorCount: number; scope: VireoFormErrorSummaryScope };
export interface VireoFormErrorSummaryRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryTitleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryGroupSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryGroupLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryListSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryItemSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormErrorSummaryItemButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormErrorSummarySlots = { [T in VireoFormErrorSummarySlotName]: React.ElementType };
export type VireoFormErrorSummarySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormErrorSummarySlots,
  {
    /** @default Alert */
    root: SlotProps<typeof Alert, VireoFormErrorSummaryRootSlotPropsOverrides, VireoFormErrorSummaryOwnerState>;
    /** @default 'span' */
    icon: SlotProps<typeof Box, VireoFormErrorSummaryIconSlotPropsOverrides, VireoFormErrorSummaryOwnerState>;
    /** @default Box */
    content: SlotProps<typeof Box, VireoFormErrorSummaryContentSlotPropsOverrides, VireoFormErrorSummaryOwnerState>;
    /** @default Typography */
    title: SlotProps<typeof Typography, VireoFormErrorSummaryTitleSlotPropsOverrides, VireoFormErrorSummaryOwnerState>;
    /** @default Box */
    group: SlotProps<typeof Box, VireoFormErrorSummaryGroupSlotPropsOverrides, VireoFormErrorSummaryOwnerState>;
    /** @default Typography */
    groupLabel: SlotProps<
      typeof Typography,
      VireoFormErrorSummaryGroupLabelSlotPropsOverrides,
      VireoFormErrorSummaryOwnerState
    >;
    /** @default 'ul' */
    list: SlotProps<typeof Box, VireoFormErrorSummaryListSlotPropsOverrides, VireoFormErrorSummaryOwnerState>;
    /** @default 'li' */
    item: SlotProps<typeof Box, VireoFormErrorSummaryItemSlotPropsOverrides, VireoFormErrorSummaryOwnerState>;
    /** @default ButtonBase */
    itemButton: SlotProps<
      typeof ButtonBase,
      VireoFormErrorSummaryItemButtonSlotPropsOverrides,
      VireoFormErrorSummaryOwnerState
    >;
  }
>;
export type VireoFormErrorSummaryOwnProps = VireoFormErrorSummarySlotsAndSlotProps & {
  classes?: Partial<VireoFormErrorSummaryClasses>;
  localeText?: Partial<VireoFormErrorSummaryLocaleText>;
  /** Includes only form-level errors or every field error grouped by step. @default 'form' */
  scope?: VireoFormErrorSummaryScope;
  /** Replaces the generated error-count heading. */
  title?: React.ReactNode;
};
export type VireoFormErrorSummaryInheritedProps = Omit<
  AlertProps,
  "children" | "icon" | "ref" | "severity" | "slotProps" | "slots" | "title"
>;
export type VireoFormErrorSummaryProps = VireoFormErrorSummaryOwnProps & VireoFormErrorSummaryInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_ERROR_SUMMARY_NAME]?: VireoThemeComponent<
      VireoFormErrorSummaryProps,
      VireoFormErrorSummaryClassKey,
      VireoFormErrorSummaryOwnerState,
      Theme
    >;
  }
}
