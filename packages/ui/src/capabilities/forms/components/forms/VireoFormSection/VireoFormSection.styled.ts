import type { StyledSlotComponent, StyledSlotProps } from "@/core/public";
import { Box, type BoxProps, Typography, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_SECTION_NAME } from "./VireoFormSection.identity";
import type { VireoFormSectionOwnerState } from "./VireoFormSection.types";
type VireoFormSectionStyledSlotProps = StyledSlotProps<VireoFormSectionOwnerState>;
type VireoFormSectionStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormSectionOwnerState
>;

export const VireoFormSectionRoot: VireoFormSectionStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<VireoFormSectionStyledSlotProps>(({ theme }) => ({
  containerName: "vireo-form-section",
  containerType: "inline-size",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  minWidth: 0,
}));

export const VireoFormSectionHeader: VireoFormSectionStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Header",
  overridesResolver: (_p, s) => s.header,
})<VireoFormSectionStyledSlotProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const VireoFormSectionLabel: VireoFormSectionStyledSlotComponent<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Label",
  overridesResolver: (_p, s) => s.label,
})<VireoFormSectionStyledSlotProps>({ fontSize: "1.125rem", fontWeight: 600, lineHeight: "1.75rem" });

export const VireoFormSectionDescription: VireoFormSectionStyledSlotComponent<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Description",
  overridesResolver: (_p, s) => s.description,
})<VireoFormSectionStyledSlotProps>(({ theme }) => ({ color: theme.palette.text.secondary }));

export const VireoFormSectionContent: VireoFormSectionStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Content",
  overridesResolver: (_p, s) => s.content,
})<VireoFormSectionStyledSlotProps>(({ theme, ownerState }) => ({
  containerName: "vireo-form-section-content",
  containerType: "inline-size",
  minWidth: 0,
  ...(ownerState.variant === "outlined" && {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    "@container vireo-form-section (min-width: 30rem)": {
      padding: theme.spacing(3),
    },
  }),
}));

export const VireoFormSectionLayout: VireoFormSectionStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_SECTION_NAME,
  slot: "Layout",
  overridesResolver: (_p, s) => s.layout,
})<VireoFormSectionStyledSlotProps>(({ theme, ownerState }) => ({
  display: ownerState.layout === "grid" ? "grid" : "flex",
  flexDirection: ownerState.layout === "stack" ? "column" : undefined,
  gap: theme.spacing(2),
  gridTemplateColumns: ownerState.layout === "grid" ? "minmax(0, 1fr)" : undefined,
  minWidth: 0,
  ...(ownerState.layout === "grid" &&
    ownerState.maxColumns >= 2 && {
      "@container vireo-form-section-content (min-width: 36rem)": {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
    }),
  ...(ownerState.layout === "grid" &&
    ownerState.maxColumns >= 3 && {
      "@container vireo-form-section-content (min-width: 60rem)": {
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      },
    }),
}));
