import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, Typography, type BoxProps, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_PAGE_HEADER_NAME } from "./VireoPageHeader.identity";
import type { VireoPageHeaderOwnerState } from "./VireoPageHeader.types";

type Owner = StyledSlotProps<VireoPageHeaderOwnerState>;
type Slot<T extends object> = StyledSlotComponent<T, VireoPageHeaderOwnerState>;
export const VireoPageHeaderRoot: Slot<BoxProps> = styled(Box, {
  name: VIREO_PAGE_HEADER_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>(({ theme }) => ({
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flex: "0 0 auto",
  gap: theme.spacing(2),
  minHeight: 64,
  padding: theme.spacing(1.5, 3),
}));
export const VireoPageHeaderLeading: Slot<BoxProps> = styled(Box, {
  name: VIREO_PAGE_HEADER_NAME,
  slot: "Leading",
  overridesResolver: (_p, s) => s.leading,
})<Owner>({ alignItems: "center", display: "flex", flex: "0 0 auto" });
export const VireoPageHeaderTitle: Slot<TypographyProps> = styled(Typography, {
  name: VIREO_PAGE_HEADER_NAME,
  slot: "Title",
  overridesResolver: (_p, s) => s.title,
})<Owner>({ flex: "1 1 auto", minWidth: 0 });
export const VireoPageHeaderActions: Slot<BoxProps> = styled(Box, {
  name: VIREO_PAGE_HEADER_NAME,
  slot: "Actions",
  overridesResolver: (_p, s) => s.actions,
})<Owner>(({ theme }) => ({ alignItems: "center", display: "flex", flex: "0 0 auto", gap: theme.spacing(1) }));
