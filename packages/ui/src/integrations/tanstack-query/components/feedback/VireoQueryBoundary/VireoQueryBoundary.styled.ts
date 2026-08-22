import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Alert,
  type AlertProps,
  Box,
  type BoxProps,
  Button,
  type ButtonProps,
  CircularProgress,
  type CircularProgressProps,
  Dialog,
  type DialogProps,
  IconButton,
  type IconButtonProps,
  Stack,
  type StackProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_QUERY_BOUNDARY_NAME } from "./VireoQueryBoundary.identity";
import { type VireoQueryBoundaryOwnerState } from "./VireoQueryBoundary.types";

type VireoQueryBoundaryStyledSlotProps = StyledSlotProps<VireoQueryBoundaryOwnerState>;
type VireoQueryBoundaryStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoQueryBoundaryOwnerState
>;

export const VireoQueryBoundaryRoot: VireoQueryBoundaryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_QUERY_BOUNDARY_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.status === "loading" && styles.loading,
    ownerState.status === "error" && styles.error,
    ownerState.hasErrorDetails && styles.hasErrorDetails,
  ],
})<VireoQueryBoundaryStyledSlotProps>(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: theme.spacing(20),
  padding: theme.spacing(2),
  width: "100%",
}));

export const VireoQueryBoundaryLoadingIndicator: VireoQueryBoundaryStyledSlotComponent<CircularProgressProps> = styled(
  CircularProgress,
  {
    name: VIREO_QUERY_BOUNDARY_NAME,
    slot: "LoadingIndicator",
    overridesResolver: (_props, styles) => styles.loadingIndicator,
  },
)<VireoQueryBoundaryStyledSlotProps>({});

export const VireoQueryBoundaryErrorAlert: VireoQueryBoundaryStyledSlotComponent<AlertProps> = styled(Alert, {
  name: VIREO_QUERY_BOUNDARY_NAME,
  slot: "ErrorAlert",
  overridesResolver: (_props, styles) => styles.errorAlert,
})<VireoQueryBoundaryStyledSlotProps>({ width: "min(100%, 36rem)" });

export const VireoQueryBoundaryActions: VireoQueryBoundaryStyledSlotComponent<StackProps> = styled(Stack, {
  name: VIREO_QUERY_BOUNDARY_NAME,
  slot: "Actions",
  overridesResolver: (_props, styles) => styles.actions,
})<VireoQueryBoundaryStyledSlotProps>(({ theme }) => ({ marginTop: theme.spacing(1.5) }));

export const VireoQueryBoundaryRetryButton: VireoQueryBoundaryStyledSlotComponent<ButtonProps> = styled(Button, {
  name: VIREO_QUERY_BOUNDARY_NAME,
  slot: "RetryButton",
  overridesResolver: (_props, styles) => styles.retryButton,
})<VireoQueryBoundaryStyledSlotProps>({});

export const VireoQueryBoundaryErrorDetailsButton: VireoQueryBoundaryStyledSlotComponent<IconButtonProps> = styled(
  IconButton,
  {
    name: VIREO_QUERY_BOUNDARY_NAME,
    slot: "ErrorDetailsButton",
    overridesResolver: (_props, styles) => styles.errorDetailsButton,
  },
)<VireoQueryBoundaryStyledSlotProps>({});

export const VireoQueryBoundaryErrorDetailsDialog: VireoQueryBoundaryStyledSlotComponent<DialogProps> = styled(Dialog, {
  name: VIREO_QUERY_BOUNDARY_NAME,
  slot: "ErrorDetailsDialog",
  overridesResolver: (_props, styles) => styles.errorDetailsDialog,
})<VireoQueryBoundaryStyledSlotProps>({});
