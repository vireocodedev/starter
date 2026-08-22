import { VireoJsonViewer } from "@/core/components/data-display/VireoJsonViewer";
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import React from "react";
import type { VireoMutationErrorDetails } from "@/core/hooks/useVireoMutation/useVireoMutation.types";

export function VireoMutationErrorDetailsButton<TDetails>({
  data,
  options,
}: {
  data: TDetails;
  options: VireoMutationErrorDetails<unknown, TDetails>;
}) {
  const [open, setOpen] = React.useState(false);
  const label = options.label ?? "Show error details";
  const handleClose = React.useCallback(() => setOpen(false), []);

  return (
    <>
      <Tooltip title={label}>
        <IconButton
          size="small"
          color="inherit"
          onClick={event => {
            event.stopPropagation();
            setOpen(true);
          }}
          aria-label={label}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-1-11h2V7h-2v2z" />
          </svg>
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          {options.title ?? "Error details"}
          <IconButton aria-label={options.closeLabel ?? "Close"} onClick={handleClose} edge="end">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <VireoJsonViewer
            data={data}
            maxHeight="60vh"
            copyLabel={options.copyLabel ?? "Copy JSON to clipboard"}
            copiedLabel={options.copiedLabel ?? "JSON copied"}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
