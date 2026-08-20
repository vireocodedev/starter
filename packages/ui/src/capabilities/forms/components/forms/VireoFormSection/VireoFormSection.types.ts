import type { VireoDataAttributeValue } from "@/core/public";
import type { Box, BoxProps, Typography } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoFormSectionClasses, VireoFormSectionClassKey } from "./VireoFormSection.classes";
import type { VIREO_FORM_SECTION_NAME, VireoFormSectionSlotName } from "./VireoFormSection.identity";
export type VireoFormSectionHeadingLevel = 2 | 3 | 4 | 5 | 6;
export type VireoFormSectionLayout = "grid" | "stack";
export type VireoFormSectionMaxColumns = 1 | 2 | 3;
export type VireoFormSectionVariant = "outlined" | "plain";

export type VireoFormSectionOwnerState = {
  hasDescription: boolean;
  headingLevel: VireoFormSectionHeadingLevel;
  layout: VireoFormSectionLayout;
  maxColumns: VireoFormSectionMaxColumns;
  variant: VireoFormSectionVariant;
};
export interface VireoFormSectionRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSectionHeaderSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSectionLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSectionDescriptionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSectionContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSectionLayoutSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormSectionSlots = { [T in VireoFormSectionSlotName]: React.ElementType };
export type VireoFormSectionSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSectionSlots,
  {
    /** @default 'section' */
    root: SlotProps<typeof Box, VireoFormSectionRootSlotPropsOverrides, VireoFormSectionOwnerState>;
    /** @default Box */
    header: SlotProps<typeof Box, VireoFormSectionHeaderSlotPropsOverrides, VireoFormSectionOwnerState>;
    /** @default Typography */
    label: SlotProps<typeof Typography, VireoFormSectionLabelSlotPropsOverrides, VireoFormSectionOwnerState>;
    /** @default Typography */
    description: SlotProps<
      typeof Typography,
      VireoFormSectionDescriptionSlotPropsOverrides,
      VireoFormSectionOwnerState
    >;
    /** @default Box */
    content: SlotProps<typeof Box, VireoFormSectionContentSlotPropsOverrides, VireoFormSectionOwnerState>;
    /** @default Box */
    layout: SlotProps<typeof Box, VireoFormSectionLayoutSlotPropsOverrides, VireoFormSectionOwnerState>;
  }
>;
export type VireoFormSectionOwnProps = VireoFormSectionSlotsAndSlotProps & {
  children: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormSectionClasses>;
  /** Supporting text associated with the named section. */
  description?: React.ReactNode;
  /** Semantic heading level used for the section label. @default 2 */
  headingLevel?: VireoFormSectionHeadingLevel;
  /** Controls whether fields use a responsive grid or an always-stacked layout. @default 'grid' */
  layout?: VireoFormSectionLayout;
  /** Accessible section heading. */
  label: React.ReactNode;
  /** Maximum number of responsive grid columns. @default 2 */
  maxColumns?: VireoFormSectionMaxColumns;
  /** Controls whether the field area owns an outlined surface. @default 'outlined' */
  variant?: VireoFormSectionVariant;
};
export type VireoFormSectionInheritedProps = Omit<BoxProps<"section">, "children" | "component" | "ref">;
export type VireoFormSectionProps = VireoFormSectionOwnProps & VireoFormSectionInheritedProps;
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_FORM_SECTION_NAME]: VireoFormSectionProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_FORM_SECTION_NAME]: VireoFormSectionClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_FORM_SECTION_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_FORM_SECTION_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_FORM_SECTION_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_FORM_SECTION_NAME];
    };
  }
}
