import type { VireoDataAttributeValue } from "@/core/public";
import { Box, Typography, type BoxProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoFormSectionClasses, VireoFormSectionClassKey } from "./VireoFormSection.classes";
import type { VIREO_FORM_SECTION_NAME, VireoFormSectionSlotName } from "./VireoFormSection.identity";
export type VireoFormSectionOwnerState = { labelled: boolean };
export interface VireoFormSectionRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSectionLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormSectionContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormSectionSlots = { [T in VireoFormSectionSlotName]: React.ElementType };
export type VireoFormSectionSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSectionSlots,
  {
    root: SlotProps<typeof Box, VireoFormSectionRootSlotPropsOverrides, VireoFormSectionOwnerState>;
    label: SlotProps<typeof Typography, VireoFormSectionLabelSlotPropsOverrides, VireoFormSectionOwnerState>;
    content: SlotProps<typeof Box, VireoFormSectionContentSlotPropsOverrides, VireoFormSectionOwnerState>;
  }
>;
export type VireoFormSectionOwnProps = VireoFormSectionSlotsAndSlotProps & {
  children: React.ReactNode;
  label?: React.ReactNode;
  classes?: Partial<VireoFormSectionClasses>;
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
