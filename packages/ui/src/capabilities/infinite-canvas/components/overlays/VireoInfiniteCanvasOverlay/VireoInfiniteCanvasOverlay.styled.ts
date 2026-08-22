import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_INFINITE_CANVAS_OVERLAY_NAME } from "./VireoInfiniteCanvasOverlay.identity";
import type { VireoInfiniteCanvasOverlayOwnerState } from "./VireoInfiniteCanvasOverlay.types";
type Owner = StyledSlotProps<VireoInfiniteCanvasOverlayOwnerState>;
export const VireoInfiniteCanvasOverlayRoot: StyledSlotComponent<BoxProps, VireoInfiniteCanvasOverlayOwnerState> =
  styled(Box, { name: VIREO_INFINITE_CANVAS_OVERLAY_NAME, slot: "Root", overridesResolver: (_p, s) => s.root })<Owner>({
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  });
export const VireoInfiniteCanvasOverlayContent: StyledSlotComponent<BoxProps, VireoInfiniteCanvasOverlayOwnerState> =
  styled(Box, {
    name: VIREO_INFINITE_CANVAS_OVERLAY_NAME,
    slot: "Content",
    overridesResolver: (_p, s) => s.content,
  })<Owner>({ pointerEvents: "auto", position: "absolute" });
