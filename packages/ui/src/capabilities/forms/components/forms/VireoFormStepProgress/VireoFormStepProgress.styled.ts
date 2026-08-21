import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Box,
  ButtonBase,
  LinearProgress,
  Menu,
  MenuItem,
  Typography,
  type BoxProps,
  type ButtonBaseProps,
  type LinearProgressProps,
  type MenuItemProps,
  type MenuProps,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_STEP_PROGRESS_NAME } from "./VireoFormStepProgress.identity";
import { vireoFormStepProgressClasses } from "./VireoFormStepProgress.classes";
import { type VireoFormStepProgressOwnerState } from "./VireoFormStepProgress.types";

type VireoFormStepProgressStyledSlotProps = StyledSlotProps<VireoFormStepProgressOwnerState>;
type VireoFormStepProgressStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormStepProgressOwnerState
>;

export const VireoFormStepProgressRoot: VireoFormStepProgressStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormStepProgressStyledSlotProps>(({ ownerState }) => ({
  containerType: "inline-size",
  [`& .${vireoFormStepProgressClasses.list}`]: { display: ownerState.layout === "compact" ? "none" : "grid" },
  [`& .${vireoFormStepProgressClasses.compactRoot}`]: {
    display: ownerState.layout === "compact" ? "flex" : "none",
  },
  ...(ownerState.layout === "responsive" && {
    [`@container (max-width: ${ownerState.compactBreakpoint}px)`]: {
      [`& .${vireoFormStepProgressClasses.list}`]: { display: "none" },
      [`& .${vireoFormStepProgressClasses.compactRoot}`]: { display: "flex" },
    },
  }),
}));

export const VireoFormStepProgressList: VireoFormStepProgressStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "List",
  overridesResolver: (_props, styles) => styles.list,
})<VireoFormStepProgressStyledSlotProps>(({ theme }) => ({
  alignItems: "center",
  display: "grid",
  gap: theme.spacing(1),
  gridTemplateColumns: "repeat(var(--vireo-step-count), minmax(0, 1fr))",
  listStyle: "none",
  margin: 0,
  minWidth: 0,
  padding: 0,
}));

export const VireoFormStepProgressStep: VireoFormStepProgressStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "Step",
  overridesResolver: (_props, styles) => styles.step,
})<VireoFormStepProgressStyledSlotProps>({ alignItems: "center", display: "flex", minWidth: 0 });

export const VireoFormStepProgressStepButton: VireoFormStepProgressStyledSlotComponent<ButtonBaseProps> = styled(
  ButtonBase,
  {
    name: VIREO_FORM_STEP_PROGRESS_NAME,
    slot: "StepButton",
    overridesResolver: (_props, styles) => styles.stepButton,
  },
)<VireoFormStepProgressStyledSlotProps>(({ theme }) => ({
  alignItems: "center",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  gap: theme.spacing(1),
  minWidth: 0,
  padding: theme.spacing(0.75),
  textAlign: "start",
  width: "100%",
}));

export const VireoFormStepProgressStatusIcon: VireoFormStepProgressStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "StatusIcon",
  overridesResolver: (_props, styles) => styles.statusIcon,
})<VireoFormStepProgressStyledSlotProps>(({ ownerState, theme }) => ({
  alignItems: "center",
  backgroundColor: ownerState.step?.hasError
    ? theme.palette.error.main
    : ownerState.step?.isComplete
      ? theme.palette.success.main
      : ownerState.step?.isCurrent
        ? theme.palette.primary.main
        : theme.palette.action.disabledBackground,
  borderRadius: "50%",
  color:
    ownerState.step?.hasError || ownerState.step?.isComplete || ownerState.step?.isCurrent
      ? theme.palette.getContrastText(
          ownerState.step?.hasError
            ? theme.palette.error.main
            : ownerState.step?.isComplete
              ? theme.palette.success.main
              : theme.palette.primary.main,
        )
      : theme.palette.text.secondary,
  display: "inline-flex",
  flex: "0 0 auto",
  fontSize: theme.typography.caption.fontSize,
  fontWeight: theme.typography.fontWeightBold,
  height: 24,
  justifyContent: "center",
  width: 24,
}));

export const VireoFormStepProgressStepLabel: VireoFormStepProgressStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FORM_STEP_PROGRESS_NAME,
    slot: "StepLabel",
    overridesResolver: (_props, styles) => styles.stepLabel,
  },
)<VireoFormStepProgressStyledSlotProps>(({ ownerState, theme }) => ({
  color: ownerState.step?.isCurrent ? theme.palette.text.primary : theme.palette.text.secondary,
  fontWeight: ownerState.step?.isCurrent ? theme.typography.fontWeightMedium : undefined,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

export const VireoFormStepProgressConnector: VireoFormStepProgressStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "Connector",
  overridesResolver: (_props, styles) => styles.connector,
})<VireoFormStepProgressStyledSlotProps>(({ ownerState, theme }) => ({
  backgroundColor: ownerState.step?.isComplete ? theme.palette.success.main : theme.palette.divider,
  flex: "1 1 auto",
  height: 2,
  marginInline: theme.spacing(0.5),
  minWidth: theme.spacing(1),
}));

export const VireoFormStepProgressCompactRoot: VireoFormStepProgressStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "CompactRoot",
  overridesResolver: (_props, styles) => styles.compactRoot,
})<VireoFormStepProgressStyledSlotProps>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const VireoFormStepProgressCompactTrigger: VireoFormStepProgressStyledSlotComponent<ButtonBaseProps> = styled(
  ButtonBase,
  {
    name: VIREO_FORM_STEP_PROGRESS_NAME,
    slot: "CompactTrigger",
    overridesResolver: (_props, styles) => styles.compactTrigger,
  },
)<VireoFormStepProgressStyledSlotProps>(({ theme }) => ({
  alignItems: "center",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  gap: theme.spacing(1),
  justifyContent: "space-between",
  padding: theme.spacing(0.5),
  textAlign: "start",
  width: "100%",
}));

export const VireoFormStepProgressCompactLabel: VireoFormStepProgressStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FORM_STEP_PROGRESS_NAME,
    slot: "CompactLabel",
    overridesResolver: (_props, styles) => styles.compactLabel,
  },
)<VireoFormStepProgressStyledSlotProps>({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const VireoFormStepProgressCompactCount: VireoFormStepProgressStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FORM_STEP_PROGRESS_NAME,
    slot: "CompactCount",
    overridesResolver: (_props, styles) => styles.compactCount,
  },
)<VireoFormStepProgressStyledSlotProps>(({ theme }) => ({ color: theme.palette.text.secondary, flex: "0 0 auto" }));

export const VireoFormStepProgressCompactProgress: VireoFormStepProgressStyledSlotComponent<LinearProgressProps> =
  styled(LinearProgress, {
    name: VIREO_FORM_STEP_PROGRESS_NAME,
    slot: "CompactProgress",
    overridesResolver: (_props, styles) => styles.compactProgress,
  })<VireoFormStepProgressStyledSlotProps>({ width: "100%" });

export const VireoFormStepProgressMenu: VireoFormStepProgressStyledSlotComponent<MenuProps> = styled(Menu, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "Menu",
  overridesResolver: (_props, styles) => styles.menu,
})<VireoFormStepProgressStyledSlotProps>({});

export const VireoFormStepProgressMenuItem: VireoFormStepProgressStyledSlotComponent<MenuItemProps> = styled(MenuItem, {
  name: VIREO_FORM_STEP_PROGRESS_NAME,
  slot: "MenuItem",
  overridesResolver: (_props, styles) => styles.menuItem,
})<VireoFormStepProgressStyledSlotProps>(({ theme }) => ({ display: "flex", gap: theme.spacing(1) }));

export type { BoxProps, ButtonBaseProps, LinearProgressProps, MenuItemProps, MenuProps, TypographyProps };
