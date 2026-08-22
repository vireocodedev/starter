import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { VIREO_INFINITE_CANVAS_NAME } from "./VireoInfiniteCanvas.identity";
import type { VireoInfiniteCanvasOwnerState } from "./VireoInfiniteCanvas.types";

export const VireoInfiniteCanvasRoot: StyledSlotComponent<BoxProps, VireoInfiniteCanvasOwnerState> = styled(Box, {
  name: VIREO_INFINITE_CANVAS_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<StyledSlotProps<VireoInfiniteCanvasOwnerState>>(({ theme, ownerState }) => {
  const spacing = Math.max(1, Math.round(ownerState.gridSize * ownerState.transform.scale));
  const xSpacing = spacing * ownerState.horizontalGridFactor;
  const ySpacing = spacing * ownerState.verticalGridFactor;
  const offsetX = ((ownerState.transform.pan.x % xSpacing) + xSpacing) % xSpacing;
  const offsetY = ((ownerState.transform.pan.y % ySpacing) + ySpacing) % ySpacing;
  const line = alpha(theme.palette.text.primary, 0.12);
  return {
    backgroundColor: theme.palette.background.default,
    backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
    backgroundPosition: `${Math.round(offsetX)}px 0, 0 ${Math.round(offsetY)}px`,
    backgroundSize: `${xSpacing}px 100%, 100% ${ySpacing}px`,
    cursor: ownerState.panning ? "grabbing" : "grab",
    height: "100%",
    outline: `1px solid ${theme.palette.divider}`,
    overflow: "hidden",
    position: "relative",
    touchAction: "none",
    userSelect: "none",
    width: "100%",
  };
});
