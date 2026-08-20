import { useVireoTanStackFormContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormSubmitButtonClassKey,
  getVireoFormSubmitButtonUtilityClass,
} from "./VireoFormSubmitButton.classes";
import { VIREO_FORM_SUBMIT_BUTTON_NAME, type VireoFormSubmitButtonSlotName } from "./VireoFormSubmitButton.identity";
import { VireoFormSubmitButtonRoot } from "./VireoFormSubmitButton.styled";
import { type VireoFormSubmitButtonOwnerState, type VireoFormSubmitButtonProps } from "./VireoFormSubmitButton.types";

function useUtilityClasses(
  ownerState: VireoFormSubmitButtonOwnerState,
  classes?: VireoFormSubmitButtonProps["classes"],
) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.disabled && "disabled",
        ownerState.loading && "loading",
        ownerState.submitting && "submitting",
      ],
    } as const satisfies UtilityClassSlotMap<VireoFormSubmitButtonSlotName, VireoFormSubmitButtonClassKey>,
    getVireoFormSubmitButtonUtilityClass,
    classes,
  );
}

/**
 * Renders a submit action whose loading state follows the current Vireo form submission lifecycle.
 *
 * Consumers render it through `form.SubmitButton`; the raw runtime is intentionally capability-bound.
 */
export const VireoFormSubmitButton = React.forwardRef<HTMLButtonElement, VireoFormSubmitButtonProps>(
  function VireoFormSubmitButton(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_SUBMIT_BUTTON_NAME });
    const {
      children,
      className,
      classes: classesProp,
      disabled = false,
      loading = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;
    const form = useVireoTanStackFormContext();
    const submitting = useStore(form.store, current => current.isSubmitting);

    const ownerState: VireoFormSubmitButtonOwnerState = {
      disabled,
      loading: submitting || loading === true,
      submitting,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      component: _rootSlotComponent,
      disabled: _rootSlotDisabled,
      href: _rootSlotHref,
      loading: _rootSlotLoading,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    return (
      <VireoFormSubmitButtonRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        disabled={ownerState.disabled}
        loading={ownerState.loading}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        type="submit"
      >
        {children}
      </VireoFormSubmitButtonRoot>
    );
  },
);

VireoFormSubmitButton.displayName = VIREO_FORM_SUBMIT_BUTTON_NAME;
