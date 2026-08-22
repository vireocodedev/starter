import { useVireoTanStackFormContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import { type VireoFormResetButtonClassKey, getVireoFormResetButtonUtilityClass } from "./VireoFormResetButton.classes";
import { VIREO_FORM_RESET_BUTTON_NAME, type VireoFormResetButtonSlotName } from "./VireoFormResetButton.identity";
import { VireoFormResetButtonRoot } from "./VireoFormResetButton.styled";
import { type VireoFormResetButtonOwnerState, type VireoFormResetButtonProps } from "./VireoFormResetButton.types";

function useUtilityClasses(ownerState: VireoFormResetButtonOwnerState, classes?: VireoFormResetButtonProps["classes"]) {
  return composeClasses(
    {
      root: ["root", ownerState.dirty && "dirty", ownerState.disabled && "disabled", ownerState.pristine && "pristine"],
    } as const satisfies UtilityClassSlotMap<VireoFormResetButtonSlotName, VireoFormResetButtonClassKey>,
    getVireoFormResetButtonUtilityClass,
    classes,
  );
}

/**
 * Resets the current Vireo form and remains disabled while its values are pristine.
 *
 * Consumers render it through `form.ResetButton`; the raw runtime is intentionally capability-bound.
 */
export const VireoFormResetButton = React.forwardRef<HTMLButtonElement, VireoFormResetButtonProps>(
  function VireoFormResetButton(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_RESET_BUTTON_NAME });
    const {
      children,
      className,
      classes: classesProp,
      disabled = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;
    const form = useVireoTanStackFormContext();
    const pristine = useStore(form.store, current => current.isPristine);

    const ownerState: VireoFormResetButtonOwnerState = {
      dirty: !pristine,
      disabled: pristine || disabled,
      pristine,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      component: _rootSlotComponent,
      disabled: _rootSlotDisabled,
      href: _rootSlotHref,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    void _rootSlotComponent;
    void _rootSlotDisabled;
    void _rootSlotHref;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    return (
      <VireoFormResetButtonRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        disabled={ownerState.disabled}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        type="reset"
      >
        {children}
      </VireoFormResetButtonRoot>
    );
  },
);

VireoFormResetButton.displayName = VIREO_FORM_RESET_BUTTON_NAME;
