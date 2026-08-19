import { VireoOverlayHeader } from "@/capabilities/overlays/public";
import { RgoJsonViewer } from "@/components/data-display/RgoJsonViewer/RgoJsonViewer";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Dialog, DialogContent } from "@mui/material";

export type RgoJsonViewerDialogProps = {
  open: boolean;
  onClose: () => void;
  data: unknown;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
};

/**
 * MUI Dialog wrapping {@link RgoJsonViewer}. Use to let end users inspect
 * arbitrary JSON payloads (typically error details) in an overlay. Title is
 * the localized "Error details" string from the front-ui translation bundle
 * so the same dialog can be used app-wide for any error surface; the
 * header's built-in close button replaces a footer.
 */
export function RgoJsonViewerDialog({ open, onClose, data, maxWidth = "md" }: RgoJsonViewerDialogProps) {
  const t = useTranslationLocal();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <VireoOverlayHeader title={t("common.errorDetails")} closeLabel={t("common.close")} onClose={onClose} />
      {/* MUI removes DialogContent's top padding when it follows a DialogTitle.
          We're using VireoOverlayHeader instead, so re-add symmetric top padding
          to match the default bottom padding (20px). */}
      <DialogContent sx={{ pt: "20px" }}>
        <RgoJsonViewer data={data} maxHeight="60vh" />
      </DialogContent>
    </Dialog>
  );
}
