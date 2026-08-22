import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import { Alert, Box, Button, CircularProgress, Dialog, IconButton, Stack, type BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoQueryBoundaryClasses, type VireoQueryBoundaryClassKey } from "./VireoQueryBoundary.classes";
import type { VIREO_QUERY_BOUNDARY_NAME, VireoQueryBoundarySlotName } from "./VireoQueryBoundary.identity";

export type VireoQueryBoundaryStatus = "loading" | "error";

export type VireoQueryBoundaryOwnerState = {
  status: VireoQueryBoundaryStatus;
  hasErrorDetails: boolean;
  retryable: boolean;
};

export type VireoQueryErrorFallbackContext = {
  error: unknown;
  retry: () => void;
  retryable: boolean;
};

export type VireoQueryErrorInfo = {
  componentStack: string | null;
};

export interface VireoQueryBoundaryRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoQueryBoundaryLoadingIndicatorSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoQueryBoundaryErrorAlertSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoQueryBoundaryActionsSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoQueryBoundaryRetryButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoQueryBoundaryErrorDetailsButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoQueryBoundaryErrorDetailsDialogSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoQueryBoundary}. */
export type VireoQueryBoundarySlots = {
  [TSlotName in VireoQueryBoundarySlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoQueryBoundary}. */
export type VireoQueryBoundarySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoQueryBoundarySlots,
  {
    /** @default Box */
    root: SlotProps<typeof Box, VireoQueryBoundaryRootSlotPropsOverrides, VireoQueryBoundaryOwnerState>;
    /** @default CircularProgress */
    loadingIndicator: SlotProps<
      typeof CircularProgress,
      VireoQueryBoundaryLoadingIndicatorSlotPropsOverrides,
      VireoQueryBoundaryOwnerState
    >;
    /** @default Alert */
    errorAlert: SlotProps<typeof Alert, VireoQueryBoundaryErrorAlertSlotPropsOverrides, VireoQueryBoundaryOwnerState>;
    /** @default Stack */
    actions: SlotProps<typeof Stack, VireoQueryBoundaryActionsSlotPropsOverrides, VireoQueryBoundaryOwnerState>;
    /** @default Button */
    retryButton: SlotProps<
      typeof Button,
      VireoQueryBoundaryRetryButtonSlotPropsOverrides,
      VireoQueryBoundaryOwnerState
    >;
    /** @default IconButton */
    errorDetailsButton: SlotProps<
      typeof IconButton,
      VireoQueryBoundaryErrorDetailsButtonSlotPropsOverrides,
      VireoQueryBoundaryOwnerState
    >;
    /** @default Dialog */
    errorDetailsDialog: SlotProps<
      typeof Dialog,
      VireoQueryBoundaryErrorDetailsDialogSlotPropsOverrides,
      VireoQueryBoundaryOwnerState
    >;
  }
>;

/** Props owned by {@link VireoQueryBoundary}. */
export type VireoQueryBoundaryOwnProps = VireoQueryBoundarySlotsAndSlotProps & {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (context: VireoQueryErrorFallbackContext) => React.ReactNode;
  /** @default 'Loading' */
  loadingLabel?: string;
  /** @default 'Something went wrong' */
  errorTitle?: React.ReactNode;
  /** @default 'The requested content could not be loaded.' */
  errorMessage?: React.ReactNode;
  /** @default 'Retry' */
  retryLabel?: React.ReactNode;
  /** @default 'Show error details' */
  errorDetailsLabel?: string;
  /** @default 'Error details' */
  errorDetailsTitle?: React.ReactNode;
  /** @default 'Close error details' */
  closeErrorDetailsLabel?: string;
  /** @default 'Copy error details' */
  copyErrorDetailsLabel?: string;
  /** @default 'Error details copied' */
  copiedErrorDetailsLabel?: string;
  selectErrorDetails?: (error: unknown) => unknown;
  /** @default true */
  retryable?: boolean | ((error: unknown) => boolean);
  resetKeys?: readonly unknown[];
  onError?: (error: unknown, info: VireoQueryErrorInfo) => void;
  onRetry?: (error: unknown) => void;
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoQueryBoundaryClasses>;
};

/** Props VireoQueryBoundary inherits from its default root after excluding component-owned props. */
export type VireoQueryBoundaryInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoQueryBoundary}. */
export type VireoQueryBoundaryProps = VireoQueryBoundaryOwnProps & VireoQueryBoundaryInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_QUERY_BOUNDARY_NAME]?: VireoThemeComponent<
      VireoQueryBoundaryProps,
      VireoQueryBoundaryClassKey,
      VireoQueryBoundaryOwnerState,
      Theme
    >;
  }
}
