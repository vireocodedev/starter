import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { VireoMultiStepContext } from "@/capabilities/forms/contexts/VireoMultiStepContext/VireoMultiStepContext";
import type { VireoMultiStepStore } from "@/capabilities/forms/state/vireoMultiStepStore/vireoMultiStepStore";
import { defaultVireoFormMultiStepLocaleText } from "@/capabilities/forms/types/vireoMultiStep.types";
import { type VireoFormMultiStepClassKey, getVireoFormMultiStepUtilityClass } from "./VireoFormMultiStep.classes";
import { VIREO_FORM_MULTI_STEP_NAME, type VireoFormMultiStepSlotName } from "./VireoFormMultiStep.identity";
import { VireoFormMultiStepRoot } from "./VireoFormMultiStep.styled";
import { type VireoFormMultiStepOwnerState, type VireoFormMultiStepProps } from "./VireoFormMultiStep.types";

function useUtilityClasses(_ownerState: VireoFormMultiStepOwnerState, classes?: VireoFormMultiStepProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoFormMultiStepSlotName, VireoFormMultiStepClassKey>,
    getVireoFormMultiStepUtilityClass,
    classes,
  );
}

type VireoFormMultiStepRuntimeProps = VireoFormMultiStepProps & { controller: VireoMultiStepStore };

/** Provides the rendering, locale, registration, and focus boundary for a bound Vireo multi-step form. */
export const VireoFormMultiStep = React.forwardRef<HTMLDivElement, VireoFormMultiStepProps>(
  function VireoFormMultiStep(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_MULTI_STEP_NAME }) as VireoFormMultiStepRuntimeProps;
    const {
      children,
      className,
      classes: classesProp,
      controller,
      keepMounted = false,
      localeText,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const ownerState: VireoFormMultiStepOwnerState = { keepMounted };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const resolvedLocaleText = React.useMemo(
      () => ({ ...defaultVireoFormMultiStepLocaleText, ...localeText }),
      [localeText],
    );

    return (
      <VireoMultiStepContext.Provider value={{ controller, keepMounted, localeText: resolvedLocaleText }}>
        <VireoFormMultiStepRoot
          {...other}
          {...rootSlotOther}
          as={slots.root ?? "div"}
          ref={rootRef}
          ownerState={ownerState}
          className={joinClassNames(classes.root, className, rootSlotClassName)}
          style={{ ...style, ...rootSlotStyle }}
          sx={mergeSx(sx, rootSlotSx)}
        >
          {children}
        </VireoFormMultiStepRoot>
      </VireoMultiStepContext.Provider>
    );
  },
);

VireoFormMultiStep.displayName = VIREO_FORM_MULTI_STEP_NAME;
