import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_PAGE_NAME } from "./VireoPage.identity";
import type { VireoPageOwnerState } from "./VireoPage.types";

export const VireoPageRoot: StyledSlotComponent<BoxProps, VireoPageOwnerState> = styled(Box, {
  name: VIREO_PAGE_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<StyledSlotProps<VireoPageOwnerState>>({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  minHeight: 0,
  minWidth: 0,
  overflow: "hidden",
});
