import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, Container, type BoxProps, type ContainerProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_PAGE_BODY_NAME } from "./VireoPageBody.identity";
import type { VireoPageBodyOwnerState } from "./VireoPageBody.types";

type Owner = StyledSlotProps<VireoPageBodyOwnerState>;
type Slot<T extends object> = StyledSlotComponent<T, VireoPageBodyOwnerState>;
export const VireoPageBodyRoot: Slot<BoxProps> = styled(Box, {
  name: VIREO_PAGE_BODY_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({ display: "flex", flex: "1 1 auto", minHeight: 0, minWidth: 0, overflow: "hidden" });
export const VireoPageBodyContent: Slot<BoxProps> = styled(Box, {
  name: VIREO_PAGE_BODY_NAME,
  slot: "Content",
  overridesResolver: (_p, s) => s.content,
})<Owner>({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  minWidth: 0,
  overflow: "auto",
  position: "relative",
});
export const VireoPageBodyContainer: Slot<ContainerProps> = styled(Container, {
  name: VIREO_PAGE_BODY_NAME,
  slot: "Container",
  overridesResolver: (_p, s) => s.container,
})<Owner>({ flex: "1 1 auto", width: "100%" });
export const VireoPageBodyDrawer: Slot<BoxProps> = styled(Box, {
  name: VIREO_PAGE_BODY_NAME,
  slot: "Drawer",
  overridesResolver: (_p, s) => s.drawer,
})<Owner>({ flex: "0 0 auto", minHeight: 0 });
