import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Typography,
  type AccordionDetailsProps,
  type AccordionProps,
  type AccordionSummaryProps,
  type BoxProps,
  type CardProps,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_PREFERENCE_PANEL_NAME } from "./VireoPreferencePanel.identity";
import { type VireoPreferencePanelOwnerState } from "./VireoPreferencePanel.types";

type VireoPreferencePanelStyledSlotProps = StyledSlotProps<VireoPreferencePanelOwnerState>;
type VireoPreferencePanelStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoPreferencePanelOwnerState
>;

export const VireoPreferencePanelRoot: VireoPreferencePanelStyledSlotComponent<CardProps> = styled(Card, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoPreferencePanelStyledSlotProps>(({ theme, ownerState }) => ({
  overflow: "clip",
  borderRadius: ownerState.isCompact ? 0 : theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
}));

export const VireoPreferencePanelSection: VireoPreferencePanelStyledSlotComponent<AccordionProps> = styled(Accordion, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "Section",
  overridesResolver: (_props, styles) => styles.section,
})<VireoPreferencePanelStyledSlotProps>(({ theme }) => ({
  margin: 0,
  borderRadius: 0,
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  boxShadow: "none",
  "&::before": { display: "none" },
  "& + &": { borderTop: `1px solid ${theme.palette.divider}` },
  "&.Mui-expanded": { margin: 0 },
}));

export const VireoPreferencePanelSectionHeader: VireoPreferencePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "SectionHeader",
  overridesResolver: (_props, styles) => styles.sectionHeader,
})<VireoPreferencePanelStyledSlotProps>(({ theme, ownerState }) => ({
  position: ownerState.stickySectionHeaders ? "sticky" : "relative",
  top: ownerState.stickySectionHeaders ? 0 : undefined,
  zIndex: ownerState.stickySectionHeaders ? theme.zIndex.appBar - 1 : undefined,
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const VireoPreferencePanelSectionSummary: VireoPreferencePanelStyledSlotComponent<AccordionSummaryProps> =
  styled(AccordionSummary, {
    name: VIREO_PREFERENCE_PANEL_NAME,
    slot: "SectionSummary",
    overridesResolver: (_props, styles) => styles.sectionSummary,
  })<VireoPreferencePanelStyledSlotProps>(({ theme, ownerState }) => ({
    flex: "1 1 auto",
    minWidth: 0,
    minHeight: ownerState.isCompact ? 48 : 56,
    paddingInline: ownerState.isCompact ? theme.spacing(2) : theme.spacing(3),
    "&.Mui-expanded": { minHeight: ownerState.isCompact ? 48 : 56 },
    "& .MuiAccordionSummary-content": {
      marginBlock: theme.spacing(1.5),
      minWidth: 0,
      fontWeight: theme.typography.fontWeightBold,
    },
    "& .MuiAccordionSummary-content.Mui-expanded": { marginBlock: theme.spacing(1.5) },
  }));

export const VireoPreferencePanelSectionAction: VireoPreferencePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "SectionAction",
  overridesResolver: (_props, styles) => styles.sectionAction,
})<VireoPreferencePanelStyledSlotProps>(({ theme, ownerState }) => ({
  flex: "0 0 auto",
  paddingInlineEnd: ownerState.isCompact ? theme.spacing(1) : theme.spacing(2),
}));

export const VireoPreferencePanelSectionDetails: VireoPreferencePanelStyledSlotComponent<AccordionDetailsProps> =
  styled(AccordionDetails, {
    name: VIREO_PREFERENCE_PANEL_NAME,
    slot: "SectionDetails",
    overridesResolver: (_props, styles) => styles.sectionDetails,
  })<VireoPreferencePanelStyledSlotProps>({ padding: 0 });

export const VireoPreferencePanelItem: VireoPreferencePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "Item",
  overridesResolver: (_props, styles) => styles.item,
})<VireoPreferencePanelStyledSlotProps>(({ theme, ownerState }) => ({
  display: "grid",
  gridTemplateColumns: ownerState.isCompact
    ? "24px minmax(0, 1fr)"
    : `24px minmax(0, 1fr) minmax(0, ${typeof ownerState.controlWidth === "number" ? `${ownerState.controlWidth}px` : ownerState.controlWidth})`,
  alignItems: ownerState.isCompact ? "start" : "center",
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1.5),
  minWidth: 0,
  padding: ownerState.isCompact ? theme.spacing(2) : theme.spacing(2.5, 3),
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create("background-color", { duration: theme.transitions.duration.shortest }),
  "& + &": { borderTop: `1px solid ${theme.palette.divider}` },
  "&:hover": { backgroundColor: theme.palette.action.hover },
}));

export const VireoPreferencePanelItemIcon: VireoPreferencePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "ItemIcon",
  overridesResolver: (_props, styles) => styles.itemIcon,
})<VireoPreferencePanelStyledSlotProps>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 24,
  minHeight: 24,
  color: theme.palette.text.secondary,
}));

export const VireoPreferencePanelItemContent: VireoPreferencePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "ItemContent",
  overridesResolver: (_props, styles) => styles.itemContent,
})<VireoPreferencePanelStyledSlotProps>({ minWidth: 0 });

export const VireoPreferencePanelItemTitle: VireoPreferencePanelStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_PREFERENCE_PANEL_NAME,
    slot: "ItemTitle",
    overridesResolver: (_props, styles) => styles.itemTitle,
  },
)<VireoPreferencePanelStyledSlotProps>(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightBold,
}));

export const VireoPreferencePanelItemDescription: VireoPreferencePanelStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_PREFERENCE_PANEL_NAME,
    slot: "ItemDescription",
    overridesResolver: (_props, styles) => styles.itemDescription,
  },
)<VireoPreferencePanelStyledSlotProps>(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
}));

export const VireoPreferencePanelItemControl: VireoPreferencePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "ItemControl",
  overridesResolver: (_props, styles) => styles.itemControl,
})<VireoPreferencePanelStyledSlotProps>(({ ownerState }) => ({
  gridColumn: ownerState.isCompact ? "2" : "3",
  width: "100%",
  minWidth: 0,
}));

export const VireoPreferencePanelEmptyState: VireoPreferencePanelStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_PREFERENCE_PANEL_NAME,
  slot: "EmptyState",
  overridesResolver: (_props, styles) => styles.emptyState,
})<VireoPreferencePanelStyledSlotProps>(({ theme }) => ({
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  textAlign: "center",
}));
