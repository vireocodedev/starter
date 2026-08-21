import { useUnsavedChangesRequestDiscard, UnsavedChangesScope } from "@/capabilities/unsaved-changes/public";
import { VireoOverlayHeader } from "@/capabilities/overlays/public";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoResponsiveFormOverlayClassKey,
  getVireoResponsiveFormOverlayUtilityClass,
} from "./VireoResponsiveFormOverlay.classes";
import {
  VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
  type VireoResponsiveFormOverlaySlotName,
} from "./VireoResponsiveFormOverlay.identity";
import {
  VireoResponsiveFormOverlayActions,
  VireoResponsiveFormOverlayContent as VireoResponsiveFormOverlayContentSlot,
  VireoResponsiveFormOverlayRoot,
} from "./VireoResponsiveFormOverlay.styled";
import {
  type VireoResponsiveFormOverlayOwnerState,
  type VireoResponsiveFormOverlayProps,
} from "./VireoResponsiveFormOverlay.types";

function useUtilityClasses(
  _ownerState: VireoResponsiveFormOverlayOwnerState,
  classes?: VireoResponsiveFormOverlayProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      header: ["header"],
      content: ["content"],
      actions: ["actions"],
    } as const satisfies UtilityClassSlotMap<VireoResponsiveFormOverlaySlotName, VireoResponsiveFormOverlayClassKey>,
    getVireoResponsiveFormOverlayUtilityClass,
    classes,
  );
}

const VireoResponsiveFormOverlayContent = React.forwardRef<HTMLDivElement, VireoResponsiveFormOverlayProps>(
  function VireoResponsiveFormOverlayContent(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME });
    const {
      actions,
      children,
      className,
      classes: classesProp,
      closeDisabled = false,
      closeLabel,
      guardUnsavedChanges = true,
      onClose,
      open,
      slotProps = {},
      slots = {},
      style,
      sx,
      title,
      ...other
    } = props;
    const ownerState: VireoResponsiveFormOverlayOwnerState = { open, closeDisabled, hasActions: actions != null };
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
    const { className: headerSlotClassName, ...headerSlotOther } = resolveSlotProps(slotProps.header, ownerState);
    const { className: contentSlotClassName, ...contentSlotOther } = resolveSlotProps(slotProps.content, ownerState);
    const { className: actionsSlotClassName, ...actionsSlotOther } = resolveSlotProps(slotProps.actions, ownerState);
    const guardedClose = useUnsavedChangesRequestDiscard(onClose, { disabled: closeDisabled || !guardUnsavedChanges });
    const directClose = React.useCallback(() => {
      if (!closeDisabled) onClose();
    }, [closeDisabled, onClose]);
    const requestClose = guardUnsavedChanges ? guardedClose : directClose;
    const Header = slots.header ?? VireoOverlayHeader;
    const Content = slots.content ?? VireoResponsiveFormOverlayContentSlot;
    const Actions = slots.actions ?? VireoResponsiveFormOverlayActions;

    return (
      <VireoResponsiveFormOverlayRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        open={open}
        onClose={requestClose}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <Header
          {...headerSlotOther}
          ownerState={ownerState}
          className={joinClassNames(classes.header, headerSlotClassName)}
          title={title}
          closeLabel={closeLabel}
          closeDisabled={closeDisabled}
          onClose={requestClose}
        />
        <Content
          {...contentSlotOther}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentSlotClassName)}
        >
          {children}
        </Content>
        {actions != null && (
          <Actions
            {...actionsSlotOther}
            ownerState={ownerState}
            className={joinClassNames(classes.actions, actionsSlotClassName)}
          >
            {actions}
          </Actions>
        )}
      </VireoResponsiveFormOverlayRoot>
    );
  },
);

/** Coordinates a guarded form across mobile bottom-sheet and desktop overlay surfaces. */
export const VireoResponsiveFormOverlay = React.forwardRef<HTMLDivElement, VireoResponsiveFormOverlayProps>(
  function VireoResponsiveFormOverlay(props, forwardedRef) {
    return (
      <UnsavedChangesScope>
        <VireoResponsiveFormOverlayContent {...props} ref={forwardedRef} />
      </UnsavedChangesScope>
    );
  },
);

VireoResponsiveFormOverlay.displayName = VIREO_RESPONSIVE_FORM_OVERLAY_NAME;
