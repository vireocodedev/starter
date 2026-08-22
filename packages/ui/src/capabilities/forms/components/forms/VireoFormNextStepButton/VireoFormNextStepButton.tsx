import { useVireoMultiStepContext } from "@/capabilities/forms/contexts/VireoMultiStepContext/VireoMultiStepContext";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  getVireoFormNextStepButtonUtilityClass,
  type VireoFormNextStepButtonClassKey,
} from "./VireoFormNextStepButton.classes";
import {
  VIREO_FORM_NEXT_STEP_BUTTON_NAME,
  type VireoFormNextStepButtonSlotName,
} from "./VireoFormNextStepButton.identity";
import { VireoFormNextStepButtonLoadingIndicator, VireoFormNextStepButtonRoot } from "./VireoFormNextStepButton.styled";
import type { VireoFormNextStepButtonOwnerState, VireoFormNextStepButtonProps } from "./VireoFormNextStepButton.types";

function useUtilityClasses(
  ownerState: VireoFormNextStepButtonOwnerState,
  classes?: VireoFormNextStepButtonProps["classes"],
) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.disabled && "disabled",
        ownerState.loading && "loading",
        ownerState.lastStep && "lastStep",
      ],
      loadingIndicator: ["loadingIndicator"],
    } as const satisfies UtilityClassSlotMap<VireoFormNextStepButtonSlotName, VireoFormNextStepButtonClassKey>,
    getVireoFormNextStepButtonUtilityClass,
    classes,
  );
}

/** Validates and advances the current step, then yields to the final submit action. */
export const VireoFormNextStepButton = React.forwardRef<HTMLButtonElement, VireoFormNextStepButtonProps>(
  function VireoFormNextStepButton(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_NEXT_STEP_BUTTON_NAME });
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
      variant = "contained",
      visibility = "auto",
      ...other
    } = props;
    const { controller, localeText } = useVireoMultiStepContext();
    const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const ownerState: VireoFormNextStepButtonOwnerState = {
      disabled: disabled || state.isStepTransitioning || (state.isLastStep && visibility === "always"),
      lastStep: state.isLastStep,
      loading: loading === true || state.isStepTransitioning,
      visibility,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedLoadingSlotProps = resolveSlotProps(slotProps.loadingIndicator, ownerState);
    const {
      className: rootSlotClassName,
      component: _component,
      disabled: _disabled,
      href: _href,
      loading: _loading,
      loadingIndicator: _indicator,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const { className: loadingClassName, ...loadingOther } = resolvedLoadingSlotProps;
    void _component;
    void _disabled;
    void _href;
    void _loading;
    void _indicator;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const LoadingIndicator = slots.loadingIndicator ?? VireoFormNextStepButtonLoadingIndicator;
    if (state.isLastStep && visibility === "auto") return null;
    return (
      <VireoFormNextStepButtonRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        aria-busy={ownerState.loading || undefined}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        disabled={ownerState.disabled}
        loading={ownerState.loading}
        loadingIndicator={
          <LoadingIndicator
            {...loadingOther}
            ownerState={ownerState}
            size={16}
            className={joinClassNames(classes.loadingIndicator, loadingClassName)}
          />
        }
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        type="submit"
        variant={variant}
      >
        {children ?? localeText.nextButton}
      </VireoFormNextStepButtonRoot>
    );
  },
);
VireoFormNextStepButton.displayName = VIREO_FORM_NEXT_STEP_BUTTON_NAME;
