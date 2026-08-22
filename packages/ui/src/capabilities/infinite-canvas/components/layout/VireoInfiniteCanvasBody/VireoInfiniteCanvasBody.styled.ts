import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_INFINITE_CANVAS_BODY_NAME } from "./VireoInfiniteCanvasBody.identity";
import type { VireoInfiniteCanvasBodyOwnerState } from "./VireoInfiniteCanvasBody.types";
export const VireoInfiniteCanvasBodyRoot: StyledSlotComponent<BoxProps, VireoInfiniteCanvasBodyOwnerState> = styled(
  Box,
  { name: VIREO_INFINITE_CANVAS_BODY_NAME, slot: "Root", overridesResolver: (_p, s) => s.root },
)<StyledSlotProps<VireoInfiniteCanvasBodyOwnerState>>(({ ownerState }) => ({
  inset: 0,
  position: "absolute",
  transform: `translate(${ownerState.transform.pan.x}px, ${ownerState.transform.pan.y}px) scale(${ownerState.transform.scale})`,
  transformOrigin: "0 0",
  willChange: "transform",
}));
