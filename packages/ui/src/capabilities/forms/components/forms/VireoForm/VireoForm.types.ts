import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { SxProps, Theme } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormClasses, type VireoFormClassKey } from "./VireoForm.classes";
import type { VIREO_FORM_NAME, VireoFormSlotName } from "./VireoForm.identity";

export type VireoFormErrorDisplayPredicate = (context: { submissionAttempts: number; touched: boolean }) => boolean;

/** Controls when field errors are presented without changing validation timing. */
export type VireoFormErrorDisplay = "always" | "never" | "touched-or-submitted" | VireoFormErrorDisplayPredicate;

/** Converts a validation error into consumer-facing helper text. */
export type VireoFormErrorFormatter = (error: unknown) => string | undefined;

/** Standard content-width presets owned by {@link VireoForm}. */
export type VireoFormLayoutWidth = "standard" | "wide" | "full";

export type VireoFormOwnerState = {
  dirty: boolean;
  invalid: boolean;
  layoutWidth: VireoFormLayoutWidth;
  readOnly: boolean;
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
  /** Constrains and centers the form using Vireo's standard content-width presets. @default 'standard' */
  layoutWidth?: VireoFormLayoutWidth;
  /** Presents every bound field as a non-editable display value and suppresses form submission. @default false */
  readOnly?: boolean;
  /** Fallback shown by read-only fields with no meaningful value. @default 'Not provided' */
  readOnlyEmptyValue?: React.ReactNode;
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
  interface Components<Theme = unknown> {
    [VIREO_FORM_NAME]?: VireoThemeComponent<VireoFormProps, VireoFormClassKey, VireoFormOwnerState, Theme>;
  }
}
