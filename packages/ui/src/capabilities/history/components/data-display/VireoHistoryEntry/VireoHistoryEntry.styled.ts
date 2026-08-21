import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { VIREO_HISTORY_ENTRY_NAME } from "./VireoHistoryEntry.identity";
import { type VireoHistoryEntryOwnerState } from "./VireoHistoryEntry.types";

type VireoHistoryEntryStyledSlotProps = StyledSlotProps<VireoHistoryEntryOwnerState>;
type VireoHistoryEntryStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoHistoryEntryOwnerState
>;

export const VireoHistoryEntryRoot: VireoHistoryEntryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_HISTORY_ENTRY_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoHistoryEntryStyledSlotProps>(({ theme }) => ({
  containerType: "inline-size",
  minWidth: 0,
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,

  "& .VireoHistoryEntry-rootGroup": {
    minWidth: 0,
    overflow: "hidden",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.background.paper,
  },
  "& .VireoHistoryEntry-rootHeader": {
    display: "flex",
    alignItems: "stretch",
    minHeight: 64,
    backgroundColor: theme.palette.action.hover,
    borderBottom: `1px solid transparent`,
  },
  "& .VireoHistoryEntry-rootGroup[data-expanded] > .VireoHistoryEntry-rootHeader": {
    borderBottomColor: theme.palette.divider,
  },
  "& .VireoHistoryEntry-rootSummaryButton, & .VireoHistoryEntry-groupSummary": {
    minWidth: 0,
    justifyContent: "flex-start",
    gap: theme.spacing(1),
    textAlign: "left",
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create("background-color", { duration: 150 }),
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: -2,
    },
  },
  "& .VireoHistoryEntry-rootSummaryButton": {
    flex: "1 1 auto",
    padding: theme.spacing(1, 1.5),
  },
  "& .VireoHistoryEntry-summaryChevron": {
    flex: "0 0 auto",
    color: theme.palette.text.secondary,
    transform: "rotate(-90deg)",
    transition: theme.transitions.create("transform", { duration: 150 }),
  },
  "& [data-expanded] > * > * > .VireoHistoryEntry-summaryChevron, & [data-expanded] > * > .VireoHistoryEntry-summaryChevron":
    {
      transform: "rotate(0deg)",
    },
  "& .VireoHistoryEntry-summaryText": {
    display: "grid",
    minWidth: 0,
    gap: theme.spacing(0.25),
  },
  "& .VireoHistoryEntry-summaryPrimary": {
    minWidth: 0,
    overflow: "hidden",
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 1.35,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  "& .VireoHistoryEntry-groupIdentity": {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
  },
  "& .VireoHistoryEntry-summaryMeta": {
    overflow: "hidden",
    color: theme.palette.text.secondary,
    fontSize: theme.typography.pxToRem(13),
    lineHeight: 1.35,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  "& .VireoHistoryEntry-unchangedAction": {
    flex: "0 0 auto",
    alignSelf: "center",
    marginRight: theme.spacing(1),
    fontSize: theme.typography.pxToRem(12.5),
    fontWeight: theme.typography.fontWeightMedium,
    textTransform: "none",
    whiteSpace: "nowrap",
  },
  "& .VireoHistoryEntry-columnHeadings": {
    display: "grid",
    gridTemplateColumns: "40px minmax(140px, 24%) minmax(0, 1fr) 32px minmax(0, 1fr)",
    alignItems: "center",
    minHeight: 36,
    padding: theme.spacing(0, 1),
    color: theme.palette.text.secondary,
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
    "& > :first-of-type": { gridColumn: 2 },
    "& > :nth-of-type(2)": { gridColumn: 3 },
    "& > :nth-of-type(3)": { gridColumn: 5 },
  },
  "& .VireoHistoryEntry-fieldRow": {
    display: "grid",
    gridTemplateColumns: "40px minmax(140px, 24%) minmax(0, 1fr) 32px minmax(0, 1fr)",
    alignItems: "start",
    minWidth: 0,
    padding: theme.spacing(0.75, 1),
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
  },
  "& .VireoHistoryEntry-statusCell": {
    display: "flex",
    alignItems: "center",
    minHeight: 22,
  },
  "& .VireoHistoryEntry-statusBadge": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    flex: "0 0 22px",
    borderRadius: "50%",
    fontSize: 15,
    color: theme.palette.text.secondary,
    backgroundColor: alpha(theme.palette.text.secondary, 0.12),
    "&:focus-visible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
    '&[data-change-type="added"]': {
      color: theme.palette.success.main,
      backgroundColor: alpha(theme.palette.success.main, 0.14),
    },
    '&[data-change-type="removed"]': {
      color: theme.palette.error.main,
      backgroundColor: alpha(theme.palette.error.main, 0.14),
    },
    '&[data-change-type="updated"]': {
      color: theme.palette.warning.main,
      backgroundColor: alpha(theme.palette.warning.main, 0.14),
    },
    '&[data-change-type="moved"]': {
      color: theme.palette.info.main,
      backgroundColor: alpha(theme.palette.info.main, 0.14),
    },
    '&[data-change-type="unchanged"]': {
      color: theme.palette.text.disabled,
      backgroundColor: alpha(theme.palette.text.disabled, 0.08),
    },
  },
  "& .VireoHistoryEntry-fieldLabel": {
    minWidth: 0,
    minHeight: 22,
    paddingInlineStart: `calc(min(var(--VireoHistoryEntry-depth, 0), 4) * ${theme.spacing(2)})`,
    color: theme.palette.text.secondary,
    overflowWrap: "anywhere",
  },
  "& .VireoHistoryEntry-valueBlock": { minWidth: 0 },
  "& .VireoHistoryEntry-mobileValueLabel": { display: "none" },
  "& .VireoHistoryEntry-valueContent": {
    display: "-webkit-box",
    minWidth: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  "& .VireoHistoryEntry-valueContent[data-expanded]": {
    display: "block",
    overflow: "visible",
    WebkitLineClamp: "unset",
  },
  "& .VireoHistoryEntry-valueContent[data-removed]": {
    color: theme.palette.text.secondary,
    textDecoration: "line-through",
  },
  "& .VireoHistoryEntry-emptyValue, & .VireoHistoryEntry-arrow": { color: theme.palette.text.disabled },
  "& .VireoHistoryEntry-arrow": { textAlign: "center" },
  "& .VireoHistoryEntry-valueToggle": {
    gridColumn: "3 / 6",
    justifySelf: "start",
    minHeight: 28,
    paddingInline: 0,
  },
  "& .VireoHistoryEntry-fieldRow[data-expanded] .VireoHistoryEntry-valueBlock": {
    gridColumn: "3 / 6",
    display: "grid",
    gridTemplateColumns: "88px minmax(0, 1fr)",
    gap: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
  },
  "& .VireoHistoryEntry-fieldRow[data-expanded] .VireoHistoryEntry-mobileValueLabel": {
    display: "block",
    color: theme.palette.text.secondary,
    fontSize: theme.typography.pxToRem(12),
  },
  "& .VireoHistoryEntry-fieldRow[data-expanded] .VireoHistoryEntry-arrow": { display: "none" },
  "& .VireoHistoryEntry-nestedGroup": {
    minWidth: 0,
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
    backgroundColor: theme.palette.action.hover,
  },
  "& .VireoHistoryEntry-nestedHeader": { minWidth: 0 },
  "& .VireoHistoryEntry-groupSummary": {
    width: "100%",
    minHeight: 42,
    padding: theme.spacing(0.75, 1),
    paddingInlineStart: `calc(${theme.spacing(1)} + min(var(--VireoHistoryEntry-depth, 0), 4) * ${theme.spacing(2)})`,
  },
  "& .VireoHistoryEntry-groupCount": {
    flex: "0 0 auto",
    marginInlineStart: "auto",
    color: theme.palette.text.secondary,
    fontSize: theme.typography.pxToRem(12.5),
  },
  "& .VireoHistoryEntry-groupChildren": { minWidth: 0 },

  "@container (max-width: 679px)": {
    "& .VireoHistoryEntry-rootHeader": { display: "grid", minHeight: 56 },
    "& .VireoHistoryEntry-rootSummaryButton": { minHeight: 56, padding: theme.spacing(1) },
    "& .VireoHistoryEntry-unchangedAction": {
      justifySelf: "start",
      margin: theme.spacing(0, 1, 1),
      minHeight: 44,
    },
    "& .VireoHistoryEntry-columnHeadings": { display: "none" },
    "& .VireoHistoryEntry-fieldRow": {
      gridTemplateColumns: "32px minmax(0, 1fr)",
      gap: theme.spacing(0.5, 1),
      padding: theme.spacing(1.25, 1.5),
    },
    "& .VireoHistoryEntry-statusCell": { gridColumn: 1 },
    "& .VireoHistoryEntry-fieldLabel": {
      gridColumn: 2,
      alignSelf: "center",
      paddingInlineStart: 0,
      color: theme.palette.text.primary,
      fontWeight: theme.typography.fontWeightMedium,
    },
    "& .VireoHistoryEntry-valueBlock": {
      gridColumn: "1 / -1",
      display: "grid",
      gap: theme.spacing(0.25),
      paddingInlineStart: theme.spacing(5),
    },
    "& .VireoHistoryEntry-valueBlock[data-empty]": { display: "none" },
    "& .VireoHistoryEntry-mobileValueLabel": {
      display: "block",
      color: theme.palette.text.secondary,
      fontSize: theme.typography.pxToRem(12.5),
    },
    "& .VireoHistoryEntry-valueContent": { WebkitLineClamp: 4 },
    "& .VireoHistoryEntry-arrow": { display: "none" },
    "& .VireoHistoryEntry-valueToggle": {
      gridColumn: "1 / -1",
      justifySelf: "start",
      minHeight: 44,
      marginInlineStart: theme.spacing(4),
    },
    "& .VireoHistoryEntry-fieldRow[data-expanded] .VireoHistoryEntry-valueBlock": {
      gridColumn: "1 / -1",
      display: "grid",
      gridTemplateColumns: "1fr",
      paddingInlineStart: theme.spacing(5),
    },
    "& .VireoHistoryEntry-groupSummary": {
      minHeight: 48,
      paddingInlineStart: `calc(${theme.spacing(1)} + min(var(--VireoHistoryEntry-depth, 0), 2) * ${theme.spacing(1.5)})`,
    },
    "& .VireoHistoryEntry-groupChildren": {
      marginInlineStart: theme.spacing(1.5),
      borderInlineStart: `2px solid ${theme.palette.divider}`,
    },
  },

  "@media (prefers-reduced-motion: reduce)": {
    "& .VireoHistoryEntry-summaryChevron, & .VireoHistoryEntry-rootSummaryButton, & .VireoHistoryEntry-groupSummary": {
      transition: "none",
    },
  },
}));
