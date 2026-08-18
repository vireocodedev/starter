import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/utils/muiutils";
import { type IconButtonProps, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoOverlayHeaderClassKey, getVireoOverlayHeaderUtilityClass } from "./VireoOverlayHeader.classes";
import { VIREO_OVERLAY_HEADER_NAME, type VireoOverlayHeaderSlotName } from "./VireoOverlayHeader.identity";
import {
  VireoOverlayHeaderActions,
  VireoOverlayHeaderCloseButton,
  VireoOverlayHeaderCloseIcon,
  VireoOverlayHeaderLeadingAction,
  VireoOverlayHeaderRoot,
  VireoOverlayHeaderTitle,
} from "./VireoOverlayHeader.styled";
import { type VireoOverlayHeaderOwnerState, type VireoOverlayHeaderProps } from "./VireoOverlayHeader.types";

function useUtilityClasses(_ownerState: VireoOverlayHeaderOwnerState, classes?: VireoOverlayHeaderProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      leadingAction: ["leadingAction"],
      title: ["title"],
      actions: ["actions"],
      closeButton: ["closeButton"],
      closeIcon: ["closeIcon"],
    } as const satisfies UtilityClassSlotMap<VireoOverlayHeaderSlotName, VireoOverlayHeaderClassKey>,
    getVireoOverlayHeaderUtilityClass,
    classes,
  );
}

/**
 * Renders the standard header anatomy for Vireo dialogs, drawers, bottom sheets, and side panels.
 */
export const VireoOverlayHeader = React.forwardRef<HTMLElement, VireoOverlayHeaderProps>(
  function VireoOverlayHeader(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_OVERLAY_HEADER_NAME });
    const {
      actions,
      className,
      classes: classesProp,
      closeDisabled = false,
      closeLabel,
      leadingAction,
      onClose,
      slotProps = {},
      slots = {},
      sticky = true,
      style,
      sx,
      title,
      titleId,
      ...other
    } = props;

    const generatedTitleId = React.useId();
    const ownerState: VireoOverlayHeaderOwnerState = {
      sticky,
      closable: onClose !== undefined,
      closeDisabled,
      hasLeadingAction: leadingAction !== undefined && leadingAction !== null,
      hasActions: actions !== undefined && actions !== null,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedLeadingActionSlotProps = resolveSlotProps(slotProps.leadingAction, ownerState);
    const resolvedTitleSlotProps = resolveSlotProps(slotProps.title, ownerState);
    const resolvedActionsSlotProps = resolveSlotProps(slotProps.actions, ownerState);
    const resolvedCloseButtonSlotProps = resolveSlotProps(slotProps.closeButton, ownerState);
    const resolvedCloseIconSlotProps = resolveSlotProps(slotProps.closeIcon, ownerState);

    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const { className: leadingActionSlotClassName, ...leadingActionSlotOther } = resolvedLeadingActionSlotProps;
    const { className: titleSlotClassName, id: titleSlotId, ...titleSlotOther } = resolvedTitleSlotProps;
    const { className: actionsSlotClassName, ...actionsSlotOther } = resolvedActionsSlotProps;
    const {
      className: closeButtonSlotClassName,
      disabled: closeButtonSlotDisabled,
      onClick: closeButtonSlotOnClick,
      ...closeButtonSlotOther
    } = resolvedCloseButtonSlotProps;
    const { className: closeIconSlotClassName, ...closeIconSlotOther } = resolvedCloseIconSlotProps;

    const resolvedTitleId = titleId ?? titleSlotId ?? generatedTitleId;
    const effectiveCloseDisabled = closeDisabled || closeButtonSlotDisabled === true;
    const handleClose = React.useCallback<NonNullable<IconButtonProps["onClick"]>>(
      event => {
        closeButtonSlotOnClick?.(event);
        if (!event.defaultPrevented) {
          onClose?.(event);
        }
      },
      [closeButtonSlotOnClick, onClose],
    );

    return (
      <VireoOverlayHeaderRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "header"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {ownerState.hasLeadingAction && (
          <VireoOverlayHeaderLeadingAction
            {...leadingActionSlotOther}
            as={slots.leadingAction}
            ownerState={ownerState}
            className={joinClassNames(classes.leadingAction, leadingActionSlotClassName)}
          >
            {leadingAction}
          </VireoOverlayHeaderLeadingAction>
        )}

        <VireoOverlayHeaderTitle
          variant="h6"
          {...(slots.title === undefined ? { variantMapping: { h6: "h2" } } : {})}
          {...titleSlotOther}
          as={slots.title}
          id={resolvedTitleId}
          ownerState={ownerState}
          className={joinClassNames(classes.title, titleSlotClassName)}
        >
          {title}
        </VireoOverlayHeaderTitle>

        {ownerState.hasActions && (
          <VireoOverlayHeaderActions
            {...actionsSlotOther}
            as={slots.actions}
            ownerState={ownerState}
            className={joinClassNames(classes.actions, actionsSlotClassName)}
          >
            {actions}
          </VireoOverlayHeaderActions>
        )}

        {ownerState.closable && (
          <VireoOverlayHeaderCloseButton
            {...closeButtonSlotOther}
            as={slots.closeButton}
            ownerState={ownerState}
            className={joinClassNames(classes.closeButton, closeButtonSlotClassName)}
            aria-label={closeLabel}
            disabled={effectiveCloseDisabled}
            onClick={handleClose}
          >
            <VireoOverlayHeaderCloseIcon
              {...closeIconSlotOther}
              as={slots.closeIcon}
              ownerState={ownerState}
              className={joinClassNames(classes.closeIcon, closeIconSlotClassName)}
              aria-hidden="true"
              focusable="false"
            />
          </VireoOverlayHeaderCloseButton>
        )}
      </VireoOverlayHeaderRoot>
    );
  },
);

VireoOverlayHeader.displayName = VIREO_OVERLAY_HEADER_NAME;
