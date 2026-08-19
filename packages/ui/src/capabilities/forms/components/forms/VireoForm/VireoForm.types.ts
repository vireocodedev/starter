import type { VireoDataAttributeValue } from "@/core/public";
import type { SxProps, Theme } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormClasses, type VireoFormClassKey } from "./VireoForm.classes";
import type { VIREO_FORM_NAME, VireoFormSlotName } from "./VireoForm.identity";

export type VireoFormErrorDisplayPredicate = (context: { submissionAttempts: number; touched: boolean }) => boolean;

/** Controls when field errors are presented without changing validation timing. */
export type VireoFormErrorDisplay = "always" | "never" | "touched-or-submitted" | VireoFormErrorDisplayPredicate;

/** Converts a validation error into consumer-facing helper text. */
export type VireoFormErrorFormatter = (error: unknown) => string | undefined;

export type VireoFormOwnerState = {
  dirty: boolean;
  invalid: boolean;
  submitting: boolean;
  validating: boolean;
};

export interface VireoFormRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoForm}. */
export type VireoFormSlots = {
  [TSlotName in VireoFormSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoForm}. */
export type VireoFormSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSlots,
  {
    /** @default 'form' */
    root: SlotProps<"form", VireoFormRootSlotPropsOverrides, VireoFormOwnerState>;
  }
>;

/** Props owned by {@link VireoForm}. */
export type VireoFormOwnProps = VireoFormSlotsAndSlotProps & {
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormClasses>;
  /** Controls when bound fields present validation errors. @default 'touched-or-submitted' */
  errorDisplay?: VireoFormErrorDisplay;
  /** Overrides Vireo's default validation-error formatter for bound fields. */
  formatError?: VireoFormErrorFormatter;
  /** Focuses the first focusable invalid field after a rejected submit. @default true */
  focusInvalidFieldOnSubmit?: boolean;
  /** Registers this form with the unsaved-changes capability while it is dirty. @default false */
  unsavedChangesGuard?: boolean;
  /** Adds non-form busy work to the unsaved-changes registration. @default false */
  unsavedChangesBusy?: boolean;
  /** Overrides the nearest unsaved-changes scope for this form. */
  unsavedChangesScopeId?: string;
};

/** Props VireoForm inherits from its default root after excluding component-owned props. */
export type VireoFormInheritedProps = Omit<React.ComponentPropsWithoutRef<"form">, keyof VireoFormOwnProps | "ref"> & {
  sx?: SxProps<Theme>;
};

/** Props accepted by {@link VireoForm}. */
export type VireoFormProps = VireoFormOwnProps & VireoFormInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_FORM_NAME]: VireoFormProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_FORM_NAME]: VireoFormClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_FORM_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_FORM_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_FORM_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_FORM_NAME];
    };
  }
}
