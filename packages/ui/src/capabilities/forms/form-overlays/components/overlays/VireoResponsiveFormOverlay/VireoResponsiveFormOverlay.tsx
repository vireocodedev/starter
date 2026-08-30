import { useUnsavedChangesRequestDiscard, UnsavedChangesScope } from "@/capabilities/unsaved-changes/public";
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
  VireoResponsiveFormOverlayBody,
  VireoResponsiveFormOverlayContent as VireoResponsiveFormOverlayContentSlot,
  VireoResponsiveFormOverlayFormRegions,
  VireoResponsiveFormOverlayHeader,
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
      body: ["body"],
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
      renderForm,
      slotProps = {},
      slots = {},
      style,
      sx,
      title,
      ...other
    } = props;
    const ownerState: VireoResponsiveFormOverlayOwnerState = {
      open,
      closeDisabled,
      hasActions: actions != null,
      hasFormWrapper: renderForm != null,
    };
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
    const generatedTitleId = React.useId();
    const {
      className: headerSlotClassName,
      titleId: headerSlotTitleId,
      ...headerSlotOther
    } = resolveSlotProps(slotProps.header, ownerState);
    const titleId = headerSlotTitleId ?? generatedTitleId;
    const { className: bodySlotClassName, ...bodySlotOther } = resolveSlotProps(slotProps.body, ownerState);
    const { className: contentSlotClassName, ...contentSlotOther } = resolveSlotProps(slotProps.content, ownerState);
    const { className: actionsSlotClassName, ...actionsSlotOther } = resolveSlotProps(slotProps.actions, ownerState);
    const guardedClose = useUnsavedChangesRequestDiscard(onClose, { disabled: closeDisabled || !guardUnsavedChanges });
    const directClose = React.useCallback(() => {
      if (!closeDisabled) onClose();
    }, [closeDisabled, onClose]);
    const requestClose = guardUnsavedChanges ? guardedClose : directClose;
    const resolvedActions = typeof actions === "function" ? actions({ requestClose }) : actions;
    const Header = slots.header ?? VireoResponsiveFormOverlayHeader;
    const Body = slots.body ?? VireoResponsiveFormOverlayBody;
    const Content = slots.content ?? VireoResponsiveFormOverlayContentSlot;
    const Actions = slots.actions ?? VireoResponsiveFormOverlayActions;
    const bodyRegions = (
      <>
        <Content
          {...contentSlotOther}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentSlotClassName)}
        >
          {children}
        </Content>
        {resolvedActions != null && (
          <Actions
            {...actionsSlotOther}
            ownerState={ownerState}
            className={joinClassNames(classes.actions, actionsSlotClassName)}
          >
            {resolvedActions}
          </Actions>
        )}
      </>
    );
    const formRegions = <VireoResponsiveFormOverlayFormRegions>{bodyRegions}</VireoResponsiveFormOverlayFormRegions>;

    return (
      <VireoResponsiveFormOverlayRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        aria-labelledby={titleId}
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
          titleId={titleId}
          closeLabel={closeLabel}
          closeDisabled={closeDisabled}
          onClose={requestClose}
        />
        <Body {...bodySlotOther} ownerState={ownerState} className={joinClassNames(classes.body, bodySlotClassName)}>
          {renderForm ? renderForm(formRegions) : bodyRegions}
        </Body>
      </VireoResponsiveFormOverlayRoot>
    );
  },
);

/** Coordinates a guarded form across mobile full-screen-dialog and desktop overlay surfaces. */
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
