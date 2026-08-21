import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type ButtonProps,
  type DialogActionsProps,
  type DialogContentProps,
  type DialogProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_CONFIRMATION_DIALOG_NAME } from "./VireoConfirmationDialog.identity";
import type { VireoConfirmationDialogOwnerState } from "./VireoConfirmationDialog.types";

type OwnerProps = StyledSlotProps<VireoConfirmationDialogOwnerState>;
type Slot<TProps extends object> = StyledSlotComponent<TProps, VireoConfirmationDialogOwnerState>;

export const VireoConfirmationDialogRoot: Slot<DialogProps> = styled(Dialog, {
  name: VIREO_CONFIRMATION_DIALOG_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<OwnerProps>({});
export const VireoConfirmationDialogContent: Slot<DialogContentProps> = styled(DialogContent, {
  name: VIREO_CONFIRMATION_DIALOG_NAME,
  slot: "Content",
  overridesResolver: (_props, styles) => styles.content,
})<OwnerProps>(({ theme }) => ({ color: theme.palette.text.secondary, whiteSpace: "pre-line" }));
export const VireoConfirmationDialogActions: Slot<DialogActionsProps> = styled(DialogActions, {
  name: VIREO_CONFIRMATION_DIALOG_NAME,
  slot: "Actions",
  overridesResolver: (_props, styles) => styles.actions,
})<OwnerProps>({});
export const VireoConfirmationDialogCancelButton: Slot<ButtonProps> = styled(Button, {
  name: VIREO_CONFIRMATION_DIALOG_NAME,
  slot: "CancelButton",
  overridesResolver: (_props, styles) => styles.cancelButton,
})<OwnerProps>({});
export const VireoConfirmationDialogConfirmButton: Slot<ButtonProps> = styled(Button, {
  name: VIREO_CONFIRMATION_DIALOG_NAME,
  slot: "ConfirmButton",
  overridesResolver: (_props, styles) => styles.confirmButton,
})<OwnerProps>({});
