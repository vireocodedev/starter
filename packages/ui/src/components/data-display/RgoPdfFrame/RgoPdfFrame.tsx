import { RgoLoader } from "@/components/feedback/RgoLoader/RgoLoader";
import { type BoxProps, Box } from "@mui/material";

export type RgoPdfFrameProps = {
  /**
   * The PDF URL to embed. Pass `null`/`undefined` while still generating to
   * show the loader without rendering an empty iframe. Callers using
   * `@react-pdf/renderer` typically pass `instance.url` directly.
   */
  url: string | null | undefined;
  /** When true, overrides any URL-derived state and shows the loader. */
  loading?: boolean;
  /** Browser-native PDF viewer zoom (PDF Open Parameter). Defaults to 100. */
  zoomPct?: number;
  /** Whether to hide the browser-native PDF toolbar (PDF Open Parameter). */
  hideToolbar?: boolean;
  width?: BoxProps["width"];
  height?: BoxProps["height"];
};

const RGO_PDF_FRAME_IFRAME_STYLE: React.CSSProperties = {
  border: "none",
  width: "100%",
  height: "100%",
};

/**
 * Thin PDF preview frame using the browser's native viewer. Has no dependency
 * on `@react-pdf/renderer`; callers pass the resolved `url` and `loading`
 * separately so any PDF source works.
 */
export function RgoPdfFrame({
  url,
  width = "100%",
  height = "70svh",
  zoomPct = 100,
  hideToolbar = false,
  loading = false,
}: RgoPdfFrameProps) {
  const fullUrl = url ? `${url}#zoom=${zoomPct}&toolbar=${hideToolbar ? 0 : 1}` : null;
  const isLoading = loading || !fullUrl;

  return (
    <Box width={width} height={height} position="relative">
      {isLoading && (
        <Box width="100%" height="100%" position="absolute">
          <RgoLoader />
        </Box>
      )}
      {!isLoading && fullUrl && <iframe src={fullUrl} style={RGO_PDF_FRAME_IFRAME_STYLE} />}
    </Box>
  );
}
