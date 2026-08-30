import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoFormReadOnlyValueClassKey,
  getVireoFormReadOnlyValueUtilityClass,
} from "./VireoFormReadOnlyValue.classes";
import {
  VIREO_FORM_READ_ONLY_VALUE_NAME,
  type VireoFormReadOnlyValueSlotName,
} from "./VireoFormReadOnlyValue.identity";
import {
  VireoFormReadOnlyValueLabel,
  VireoFormReadOnlyValueRoot,
  VireoFormReadOnlyValueValue,
} from "./VireoFormReadOnlyValue.styled";
import {
  type VireoFormReadOnlyValueOwnerState,
  type VireoFormReadOnlyValueProps,
} from "./VireoFormReadOnlyValue.types";

function useUtilityClasses(
  ownerState: VireoFormReadOnlyValueOwnerState,
  classes?: VireoFormReadOnlyValueProps["classes"],
) {
  return composeClasses(
    {
      root: ["root", ownerState.empty && "empty", ownerState.hasLabel && "hasLabel"],
      label: ["label"],
      value: ["value"],
    } as const satisfies UtilityClassSlotMap<VireoFormReadOnlyValueSlotName, VireoFormReadOnlyValueClassKey>,
    getVireoFormReadOnlyValueUtilityClass,
    classes,
  );
}

/**
 * Presents a bound form value as text without editable control chrome.
 */
export const VireoFormReadOnlyValue = React.forwardRef<HTMLDivElement, VireoFormReadOnlyValueProps>(
  function VireoFormReadOnlyValue(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_READ_ONLY_VALUE_NAME });
    const {
      children,
      className,
      classes: classesProp,
      empty = false,
      emptyValue = "Not provided",
      label,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const ownerState: VireoFormReadOnlyValueOwnerState = { empty, hasLabel: label != null };
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
    const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
    const { className: labelSlotClassName, ...labelSlotOther } = resolvedLabelSlotProps;
    const resolvedValueSlotProps = resolveSlotProps(slotProps.value, ownerState);
    const { className: valueSlotClassName, ...valueSlotOther } = resolvedValueSlotProps;

    return (
      <VireoFormReadOnlyValueRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {label != null ? (
          <VireoFormReadOnlyValueLabel
            {...labelSlotOther}
            as={slots.label}
            ownerState={ownerState}
            className={joinClassNames(classes.label, labelSlotClassName)}
            variant="body2"
          >
            {label}
          </VireoFormReadOnlyValueLabel>
        ) : null}
        <VireoFormReadOnlyValueValue
          {...valueSlotOther}
          as={slots.value}
          ownerState={ownerState}
          className={joinClassNames(classes.value, valueSlotClassName)}
          variant="body1"
        >
          {empty ? emptyValue : children}
        </VireoFormReadOnlyValueValue>
      </VireoFormReadOnlyValueRoot>
    );
  },
);

VireoFormReadOnlyValue.displayName = VIREO_FORM_READ_ONLY_VALUE_NAME;
