import { useUnsavedChangesRegistration } from "@/capabilities/unsaved-changes/public";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { VireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { unstable_composeClasses as composeClasses, type BoxProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore, type AnyFormApi } from "@tanstack/react-form";
import React from "react";
import { type VireoFormClassKey, getVireoFormUtilityClass } from "./VireoForm.classes";
import { VIREO_FORM_NAME, type VireoFormSlotName } from "./VireoForm.identity";
import { VireoFormRoot } from "./VireoForm.styled";
import { type VireoFormOwnerState, type VireoFormProps } from "./VireoForm.types";
import type { VireoMultiStepStore } from "@/capabilities/forms/state/vireoMultiStepStore/vireoMultiStepStore";

type VireoFormRuntimeApi = AnyFormApi & {
  AppForm: React.ComponentType<React.PropsWithChildren>;
};

type VireoFormRuntimeProps = VireoFormProps & {
  form: VireoFormRuntimeApi;
  multiStepController?: VireoMultiStepStore;
};

function useUtilityClasses(ownerState: VireoFormOwnerState, classes?: VireoFormProps["classes"]) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.dirty && "dirty",
        ownerState.submitting && "submitting",
        ownerState.validating && "validating",
        ownerState.invalid && "invalid",
        ownerState.readOnly && "readOnly",
      ],
    } as const satisfies UtilityClassSlotMap<VireoFormSlotName, VireoFormClassKey>,
    getVireoFormUtilityClass,
    classes,
  );
}

function focusFirstInvalidField(root: HTMLFormElement | null): void {
  const invalidRegion = root?.querySelector<HTMLElement>('[data-vireo-field-invalid="true"], [aria-invalid="true"]');
  const candidate =
    invalidRegion?.querySelector<HTMLElement>('[data-vireo-field-focus-target="true"]:not([disabled])') ??
    root?.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not([disabled]), [aria-invalid="true"] input:not([disabled]), [aria-invalid="true"] textarea:not([disabled]), [aria-invalid="true"] select:not([disabled]), [aria-invalid="true"] button:not([disabled])',
    );

  if (!candidate) {
    const summary = root?.querySelector<HTMLElement>('[data-vireo-error-summary="true"]');
    summary?.focus();
    summary?.scrollIntoView?.({ block: "nearest" });
    return;
  }

  candidate.focus();
  candidate.scrollIntoView?.({ block: "nearest" });
}

/**
 * Provides the semantic form boundary, lifecycle wiring, and shared presentation policy used by `useVireoForm`.
 *
 * Consumers render this component through `form.Form`; the raw runtime is intentionally capability-bound.
 */
export const VireoForm = React.forwardRef<HTMLFormElement, VireoFormRuntimeProps>(
  function VireoForm(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_NAME });
    const {
      children,
      className,
      classes: classesProp,
      errorDisplay = "touched-or-submitted",
      focusInvalidFieldOnSubmit = true,
      form,
      formatError,
      layoutWidth = "standard",
      multiStepController,
      noValidate = true,
      onReset,
      onSubmit,
      readOnly = false,
      readOnlyEmptyValue = "Not provided",
      slotProps = {},
      slots = {},
      style,
      sx,
      unsavedChangesBusy = false,
      unsavedChangesGuard = false,
      unsavedChangesScopeId,
      ...other
    } = props;
    const rootElementRef = React.useRef<HTMLFormElement | null>(null);
    const state = useStore(form.store, current => ({
      dirty: current.isDirty,
      invalid: !current.isValid,
      submissionAttempts: current.submissionAttempts,
      submitting: current.isSubmitting,
      validating: current.isValidating,
    }));
    const ownerState: VireoFormOwnerState = {
      dirty: state.dirty,
      invalid: state.invalid,
      layoutWidth,
      readOnly,
      submitting: state.submitting,
      validating: state.validating,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    useUnsavedChangesRegistration({
      busy: state.submitting || unsavedChangesBusy,
      dirty: state.dirty,
      enabled: unsavedChangesGuard && !readOnly,
      scopeId: unsavedChangesScopeId,
    });

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      onReset: rootSlotOnReset,
      onSubmit: rootSlotOnSubmit,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef, rootElementRef);
    const inheritedRootProps = { ...other, ...rootSlotOther } as unknown as BoxProps;

    const handleSubmit = (event: React.SubmitEvent<Element>): void => {
      const formEvent = event as React.SubmitEvent<HTMLFormElement>;
      onSubmit?.(formEvent);
      if (event.defaultPrevented) return;
      rootSlotOnSubmit?.(formEvent);
      if (event.defaultPrevented) return;

      event.preventDefault();
      if (readOnly) return;
      if (multiStepController && !multiStepController.getSnapshot().isLastStep) {
        void multiStepController.goToNextStep();
        return;
      }
      void form.handleSubmit().then(() => {
        if (form.state.isValid) return;
        if (multiStepController) {
          void multiStepController.handleInvalidSubmit();
          return;
        }
        if (focusInvalidFieldOnSubmit)
          window.requestAnimationFrame(() => focusFirstInvalidField(rootElementRef.current));
      });
    };

    const handleReset = (event: React.FormEvent<Element>): void => {
      const formEvent = event as React.FormEvent<HTMLFormElement>;
      onReset?.(formEvent);
      if (event.defaultPrevented) return;
      rootSlotOnReset?.(formEvent);
      if (event.defaultPrevented) return;

      event.preventDefault();
      if (readOnly) return;
      form.reset();
    };

    return (
      <form.AppForm>
        <VireoFormContext.Provider
          value={{
            errorDisplay,
            formatError,
            readOnly,
            readOnlyEmptyValue,
            submissionAttempts: state.submissionAttempts,
          }}
        >
          <VireoFormRoot
            {...inheritedRootProps}
            as={slots.root ?? "form"}
            ref={rootRef}
            ownerState={ownerState}
            className={joinClassNames(classes.root, className, rootSlotClassName)}
            noValidate={noValidate}
            onReset={handleReset}
            onSubmit={handleSubmit}
            style={{ ...style, ...rootSlotStyle }}
            sx={mergeSx(sx, rootSlotSx)}
          >
            {children}
          </VireoFormRoot>
        </VireoFormContext.Provider>
      </form.AppForm>
    );
  },
);

VireoForm.displayName = VIREO_FORM_NAME;
