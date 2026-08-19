import type { StyledSlotComponent, StyledSlotProps } from "@/core/public";
import { Box, type BoxProps, Typography, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_SECTION_NAME } from "./VireoFormSection.identity";
import type { VireoFormSectionOwnerState } from "./VireoFormSection.types";
type Owner = StyledSlotProps<VireoFormSectionOwnerState>;
export const VireoFormSectionRoot: StyledSlotComponent<BoxProps, VireoFormSectionOwnerState> = styled(Box, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({ display: "flex", flexDirection: "column", gap: 16 });
export const VireoFormSectionLabel: StyledSlotComponent<TypographyProps, VireoFormSectionOwnerState> = styled(
  Typography,
  { name: VIREO_FORM_SECTION_NAME, slot: "Label", overridesResolver: (_p, s) => s.label },
)<Owner>({ fontSize: "1.125rem", fontWeight: 600, lineHeight: "1.75rem" });
export const VireoFormSectionContent: StyledSlotComponent<BoxProps, VireoFormSectionOwnerState> = styled(Box, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Content",
  overridesResolver: (_p, s) => s.content,
})<Owner>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 24,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  outline: `1px solid ${theme.palette.divider}`,
}));
