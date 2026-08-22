import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { useVireoMultiStepContext } from "@/capabilities/forms/contexts/VireoMultiStepContext/VireoMultiStepContext";
import { type VireoFormStepClassKey, getVireoFormStepUtilityClass } from "./VireoFormStep.classes";
import { VIREO_FORM_STEP_NAME, type VireoFormStepSlotName } from "./VireoFormStep.identity";
import { VireoFormStepLabel, VireoFormStepRoot } from "./VireoFormStep.styled";
import { type VireoFormStepOwnerState, type VireoFormStepProps } from "./VireoFormStep.types";

function useUtilityClasses(_ownerState: VireoFormStepOwnerState, classes?: VireoFormStepProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      label: ["label"],
    } as const satisfies UtilityClassSlotMap<VireoFormStepSlotName, VireoFormStepClassKey>,
    getVireoFormStepUtilityClass,
    classes,
  );
}

/** Renders the currently active configured step as an independently labelled form region. */
export const VireoFormStep = React.forwardRef<HTMLElement, VireoFormStepProps>(
  function VireoFormStep(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_STEP_NAME });
    const { children, className, classes: classesProp, id, slotProps = {}, slots = {}, style, sx, ...other } = props;
    const { controller, keepMounted } = useVireoMultiStepContext();
    const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const step = state.steps.find(item => item.id === id);
    if (!step && process.env.NODE_ENV !== "production") {
      console.warn(`Vireo form.Step received unknown step id "${id}".`);
    }

    const ownerState: VireoFormStepOwnerState = {
      active: step?.isActive ?? false,
      current: step?.isCurrent ?? false,
      keepMounted,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const internalRef = React.useRef<HTMLElement | null>(null);
    const rootRef = useForkRef(forwardedRef, rootSlotRef, internalRef);
    const { className: labelSlotClassName, ...labelSlotOther } = resolvedLabelSlotProps;
    const generatedLabelId = React.useId();
    const labelId = `vireo-form-step-${generatedLabelId}`;

    React.useLayoutEffect(
      () => controller.registerStep(id, internalRef.current),
      [controller, id, step?.isCurrent, step?.isActive, keepMounted],
    );

    if (!step?.isActive || (!step.isCurrent && !keepMounted)) return null;

    return (
      <VireoFormStepRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "section"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        aria-labelledby={step.ariaLabel ? undefined : labelId}
        aria-label={step.ariaLabel}
        hidden={!step.isCurrent}
        tabIndex={-1}
      >
        {!step.ariaLabel && (
          <VireoFormStepLabel
            {...labelSlotOther}
            as={slots.label}
            id={labelId}
            ownerState={ownerState}
            className={joinClassNames(classes.label, labelSlotClassName)}
          >
            {step.label}
          </VireoFormStepLabel>
        )}
        {children}
      </VireoFormStepRoot>
    );
  },
);

VireoFormStep.displayName = VIREO_FORM_STEP_NAME;
