import { useVireoMultiStepContext } from "@/capabilities/forms/contexts/VireoMultiStepContext/VireoMultiStepContext";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  getVireoFormPreviousStepButtonUtilityClass,
  type VireoFormPreviousStepButtonClassKey,
} from "./VireoFormPreviousStepButton.classes";
import {
  VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME,
  type VireoFormPreviousStepButtonSlotName,
} from "./VireoFormPreviousStepButton.identity";
import { VireoFormPreviousStepButtonRoot } from "./VireoFormPreviousStepButton.styled";
import type {
  VireoFormPreviousStepButtonOwnerState,
  VireoFormPreviousStepButtonProps,
} from "./VireoFormPreviousStepButton.types";

function useUtilityClasses(
  ownerState: VireoFormPreviousStepButtonOwnerState,
  classes?: VireoFormPreviousStepButtonProps["classes"],
) {
  return composeClasses(
    {
      root: ["root", ownerState.disabled && "disabled", ownerState.firstStep && "firstStep"],
    } as const satisfies UtilityClassSlotMap<VireoFormPreviousStepButtonSlotName, VireoFormPreviousStepButtonClassKey>,
    getVireoFormPreviousStepButtonUtilityClass,
    classes,
  );
}

/** Returns to the previous active step in the current bound multi-step form. */
export const VireoFormPreviousStepButton = React.forwardRef<HTMLButtonElement, VireoFormPreviousStepButtonProps>(
  function VireoFormPreviousStepButton(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME });
    const {
      children,
      className,
      classes: classesProp,
      disabled = false,
      onClick,
      slotProps = {},
      slots = {},
      style,
      sx,
      visibility = "auto",
      variant = "outlined",
      ...other
    } = props;
    const { controller, localeText } = useVireoMultiStepContext();
    const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const ownerState: VireoFormPreviousStepButtonOwnerState = {
      disabled: disabled || state.isFirstStep || state.isStepTransitioning,
      firstStep: state.isFirstStep,
      visibility,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      component: _component,
      disabled: _disabled,
      href: _href,
      onClick: rootSlotOnClick,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    void _component;
    void _disabled;
    void _href;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    if (state.isFirstStep && visibility === "auto") return null;
    return (
      <VireoFormPreviousStepButtonRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        disabled={ownerState.disabled}
        onClick={event => {
          onClick?.(event);
          rootSlotOnClick?.(event);
          if (!event.defaultPrevented) void controller.goToPreviousStep();
        }}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        type="button"
        variant={variant}
      >
        {children ?? localeText.previousButton}
      </VireoFormPreviousStepButtonRoot>
    );
  },
);
VireoFormPreviousStepButton.displayName = VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME;
