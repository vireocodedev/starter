import { VireoOverlayHeader } from "@/capabilities/overlays/public";
import { RgoJsonViewer } from "@/components/data-display/RgoJsonViewer/RgoJsonViewer";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Dialog, DialogContent, IconButton, Tooltip } from "@mui/material";
import React from "react";

export type RgoSnackDetailsButtonProps = {
  data: unknown;
  tooltip?: string;
};

/**
 * Drop into {@link RgoSnack}'s `endAdornment` to give a toast a "details"
 * button that opens arbitrary data (e.g. an error payload) in a JSON viewer
 * the user can inspect and copy.
 */
export function RgoSnackDetailsButton({ data, tooltip = "Show details" }: RgoSnackDetailsButtonProps) {
  const t = useTranslationLocal();
  const [open, setOpen] = React.useState(false);
  const handleClose = React.useCallback(() => setOpen(false), []);

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          color="inherit"
          onClick={e => {
            e.stopPropagation();
            setOpen(true);
          }}
          aria-label={tooltip}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" />
          </svg>
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <VireoOverlayHeader title={t("common.errorDetails")} closeLabel={t("common.close")} onClose={handleClose} />
        <DialogContent sx={{ pt: "20px" }}>
          <RgoJsonViewer data={data} maxHeight="60vh" />
        </DialogContent>
      </Dialog>
    </>
  );
}
