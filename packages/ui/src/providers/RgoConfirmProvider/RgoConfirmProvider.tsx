import { VireoOverlayHeader } from "@/capabilities/overlays/public";
import { type RgoProvider } from "@/providers/RgoProviders";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { type RgoMuiColor } from "@/utils/typeutils";
import {
  type DialogProps,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import htmlParse from "html-react-parser";
import React from "react";
import "./RgoConfirmProvider.css";

export type RgoConfirmDialogProps = {
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  open: boolean;
  title: React.ReactNode;
  message: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  color?: RgoMuiColor;
  maxWidth?: DialogProps["maxWidth"];
};

export type RgoConfirmDialogUiProps = Omit<RgoConfirmDialogProps, "open" | "onCancel">;

function RgoConfirmDialog({
  title,
  message,
  open,
  onConfirm,
  onCancel,
  cancelText: _cancelText,
  confirmText: _confirmText,
  maxWidth = "xs",
  color,
}: RgoConfirmDialogProps) {
  const t = useTranslationLocal();
  const cancelText = _cancelText || t("common.cancel");
  const confirmText = _confirmText || t("common.confirm");
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth={maxWidth}>
      <VireoOverlayHeader
        title={title}
        closeLabel={t("common.close")}
        closeDisabled={loading}
        onClose={onCancel}
        slotProps={color ? { title: { sx: { color: `${color}.main` } } } : undefined}
      />
      <DialogContent>
        {typeof message === "string" ? (
          <DialogContentText sx={{ whiteSpace: "pre-line", color: "unset" }}>{htmlParse(message)}</DialogContentText>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          color={color}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const RgoConfirmContext = React.createContext<((dialogUiProps: RgoConfirmDialogUiProps) => void) | undefined>(
  undefined,
);

export const RgoConfirmProvider: RgoProvider = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  const [dialogUiProps, setDialogUiProps] = React.useState<RgoConfirmDialogUiProps>({
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const confirmAction = (dialogUiProps: RgoConfirmDialogUiProps) => {
    setOpen(true);
    setDialogUiProps({
      ...dialogUiProps,
      onConfirm: async () => {
        await dialogUiProps.onConfirm();
        setOpen(false);
      },
    });
  };

  const onCancel = () => {
    setOpen(false);
  };

  const confirmDialogProps = {
    open,
    onCancel,
    ...dialogUiProps,
  };

  return (
    <RgoConfirmContext.Provider value={confirmAction}>
      <RgoConfirmDialog {...confirmDialogProps} />
      {children}
    </RgoConfirmContext.Provider>
  );
};
