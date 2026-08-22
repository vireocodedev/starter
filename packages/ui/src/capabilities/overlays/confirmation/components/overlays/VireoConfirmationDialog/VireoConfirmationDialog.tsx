import { VireoOverlayHeader } from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/VireoOverlayHeader";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { CircularProgress, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoConfirmationDialogClassKey,
  getVireoConfirmationDialogUtilityClass,
} from "./VireoConfirmationDialog.classes";
import {
  VIREO_CONFIRMATION_DIALOG_NAME,
  type VireoConfirmationDialogSlotName,
} from "./VireoConfirmationDialog.identity";
import {
  VireoConfirmationDialogActions,
  VireoConfirmationDialogCancelButton,
  VireoConfirmationDialogConfirmButton,
  VireoConfirmationDialogContent,
  VireoConfirmationDialogRoot,
} from "./VireoConfirmationDialog.styled";
import type { VireoConfirmationDialogOwnerState, VireoConfirmationDialogProps } from "./VireoConfirmationDialog.types";

function useUtilityClasses(classes?: VireoConfirmationDialogProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      header: ["header"],
      content: ["content"],
      actions: ["actions"],
      cancelButton: ["cancelButton"],
      confirmButton: ["confirmButton"],
    } as const satisfies UtilityClassSlotMap<VireoConfirmationDialogSlotName, VireoConfirmationDialogClassKey>,
    getVireoConfirmationDialogUtilityClass,
    classes,
  );
}

/** Presents a controlled, accessible confirmation decision without interpreting message strings as HTML. */
export const VireoConfirmationDialog = React.forwardRef<HTMLDivElement, VireoConfirmationDialogProps>(
  function VireoConfirmationDialog(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_CONFIRMATION_DIALOG_NAME });
    const {
      cancelLabel = "Cancel",
      className,
      classes: classesProp,
      closeLabel = "Close",
      confirmColor = "primary",
      confirmLabel = "Confirm",
      loading = false,
      maxWidth = "xs",
      message,
      onClose,
      onConfirm,
      open,
      slotProps = {},
      slots = {},
      style,
      sx,
      title,
      ...other
    } = props;
    const ownerState: VireoConfirmationDialogOwnerState = { open, loading, confirmColor };
    const classes = useUtilityClasses(classesProp);
    const rootProps = resolveSlotProps(slotProps.root, ownerState);
    const { className: rootClassName, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = rootProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const headerProps = resolveSlotProps(slotProps.header, ownerState);
    const contentProps = resolveSlotProps(slotProps.content, ownerState);
    const actionsProps = resolveSlotProps(slotProps.actions, ownerState);
    const cancelProps = resolveSlotProps(slotProps.cancelButton, ownerState);
    const confirmProps = resolveSlotProps(slotProps.confirmButton, ownerState);
    const Header = slots.header ?? VireoOverlayHeader;
    const Content = slots.content ?? VireoConfirmationDialogContent;
    const Actions = slots.actions ?? VireoConfirmationDialogActions;
    const CancelButton = slots.cancelButton ?? VireoConfirmationDialogCancelButton;
    const ConfirmButton = slots.confirmButton ?? VireoConfirmationDialogConfirmButton;

    return (
      <VireoConfirmationDialogRoot
        {...other}
        {...rootOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        open={open}
        onClose={loading ? undefined : onClose}
        maxWidth={maxWidth}
        fullWidth
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      >
        <Header
          {...headerProps}
          ownerState={ownerState}
          className={joinClassNames(classes.header, headerProps.className)}
          title={title}
          closeLabel={closeLabel}
          closeDisabled={loading}
          onClose={onClose}
        />
        <Content
          {...contentProps}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentProps.className)}
        >
          {message}
        </Content>
        <Actions
          {...actionsProps}
          ownerState={ownerState}
          className={joinClassNames(classes.actions, actionsProps.className)}
        >
          <CancelButton
            {...cancelProps}
            ownerState={ownerState}
            className={joinClassNames(classes.cancelButton, cancelProps.className)}
            color="inherit"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </CancelButton>
          <ConfirmButton
            {...confirmProps}
            ownerState={ownerState}
            className={joinClassNames(classes.confirmButton, confirmProps.className)}
            variant="contained"
            color={confirmColor}
            disabled={loading}
            onClick={onConfirm}
            startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
          >
            {confirmLabel}
          </ConfirmButton>
        </Actions>
      </VireoConfirmationDialogRoot>
    );
  },
);

VireoConfirmationDialog.displayName = VIREO_CONFIRMATION_DIALOG_NAME;
