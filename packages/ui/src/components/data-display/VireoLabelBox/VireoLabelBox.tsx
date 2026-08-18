import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoLabelBoxClassKey, getVireoLabelBoxUtilityClass } from "./VireoLabelBox.classes";
import { VIREO_LABEL_BOX_NAME, type VireoLabelBoxSlotName } from "./VireoLabelBox.identity";
import {
  VireoLabelBoxContent,
  VireoLabelBoxHeader,
  VireoLabelBoxHelperText,
  VireoLabelBoxLabel,
  VireoLabelBoxRequiredIndicator,
  VireoLabelBoxRoot,
} from "./VireoLabelBox.styled";
import { type VireoLabelBoxColor, type VireoLabelBoxOwnerState, type VireoLabelBoxProps } from "./VireoLabelBox.types";

const DEFAULT_LABEL_COLOR: VireoLabelBoxColor = theme => theme.palette.text.primary;

function useUtilityClasses(_ownerState: VireoLabelBoxOwnerState, classes?: VireoLabelBoxProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      header: ["header"],
      label: ["label"],
      requiredIndicator: ["requiredIndicator"],
      helperText: ["helperText"],
      content: ["content"],
    } as const satisfies UtilityClassSlotMap<VireoLabelBoxSlotName, VireoLabelBoxClassKey>,
    getVireoLabelBoxUtilityClass,
    classes,
  );
}

/**
 * Renders consistent label, helper-text, and content anatomy around form controls or grouped content.
 */
export const VireoLabelBox = React.forwardRef<HTMLDivElement, VireoLabelBoxProps>(
  function VireoLabelBox(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_LABEL_BOX_NAME });
    const {
      children,
      className,
      classes: classesProp,
      color = DEFAULT_LABEL_COLOR,
      direction = "column",
      fontWeight = 600,
      helperText,
      label,
      required = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const ownerState: VireoLabelBoxOwnerState = {
      direction,
      color,
      fontWeight,
      required,
      hasLabel: label !== undefined && label !== null,
      hasHelperText: helperText !== undefined && helperText !== null,
      hasHeader: (label !== undefined && label !== null) || (helperText !== undefined && helperText !== null),
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedHeaderSlotProps = resolveSlotProps(slotProps.header, ownerState);
    const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
    const resolvedRequiredIndicatorSlotProps = resolveSlotProps(slotProps.requiredIndicator, ownerState);
    const resolvedHelperTextSlotProps = resolveSlotProps(slotProps.helperText, ownerState);
    const resolvedContentSlotProps = resolveSlotProps(slotProps.content, ownerState);

    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const { className: headerSlotClassName, ...headerSlotOther } = resolvedHeaderSlotProps;
    const { className: labelSlotClassName, ...labelSlotOther } = resolvedLabelSlotProps;
    const { className: requiredIndicatorSlotClassName, ...requiredIndicatorSlotOther } =
      resolvedRequiredIndicatorSlotProps;
    const { className: helperTextSlotClassName, ...helperTextSlotOther } = resolvedHelperTextSlotProps;
    const { className: contentSlotClassName, ...contentSlotOther } = resolvedContentSlotProps;

    return (
      <VireoLabelBoxRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {ownerState.hasHeader && (
          <VireoLabelBoxHeader
            {...headerSlotOther}
            as={slots.header}
            ownerState={ownerState}
            className={joinClassNames(classes.header, headerSlotClassName)}
          >
            {ownerState.hasLabel && (
              <VireoLabelBoxLabel
                component="span"
                {...labelSlotOther}
                as={slots.label}
                ownerState={ownerState}
                className={joinClassNames(classes.label, labelSlotClassName)}
              >
                {label}
                {required && (
                  <VireoLabelBoxRequiredIndicator
                    component="span"
                    {...requiredIndicatorSlotOther}
                    as={slots.requiredIndicator}
                    ownerState={ownerState}
                    className={joinClassNames(classes.requiredIndicator, requiredIndicatorSlotClassName)}
                    aria-hidden="true"
                  >
                    {" *"}
                  </VireoLabelBoxRequiredIndicator>
                )}
              </VireoLabelBoxLabel>
            )}

            {ownerState.hasHelperText && (
              <VireoLabelBoxHelperText
                component="span"
                {...helperTextSlotOther}
                as={slots.helperText}
                ownerState={ownerState}
                className={joinClassNames(classes.helperText, helperTextSlotClassName)}
              >
                {helperText}
              </VireoLabelBoxHelperText>
            )}
          </VireoLabelBoxHeader>
        )}

        <VireoLabelBoxContent
          {...contentSlotOther}
          as={slots.content}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentSlotClassName)}
        >
          {children}
        </VireoLabelBoxContent>
      </VireoLabelBoxRoot>
    );
  },
);

VireoLabelBox.displayName = VIREO_LABEL_BOX_NAME;
