"use client";

import {
  VireoJsonViewer,
  VireoLoadingRegion,
  type UtilityClassSlotMap,
  joinClassNames,
  mergeSx,
  resolveSlotProps,
} from "@/core/public";
import Close from "@mui/icons-material/Close";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import {
  AlertTitle,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  unstable_composeClasses as composeClasses,
  type DialogProps,
} from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { type VireoQueryBoundaryClassKey, getVireoQueryBoundaryUtilityClass } from "./VireoQueryBoundary.classes";
import { VIREO_QUERY_BOUNDARY_NAME, type VireoQueryBoundarySlotName } from "./VireoQueryBoundary.identity";
import {
  VireoQueryBoundaryActions,
  VireoQueryBoundaryErrorAlert,
  VireoQueryBoundaryErrorDetailsButton,
  VireoQueryBoundaryErrorDetailsDialog,
  VireoQueryBoundaryLoadingIndicator,
  VireoQueryBoundaryRetryButton,
  VireoQueryBoundaryRoot,
} from "./VireoQueryBoundary.styled";
import {
  type VireoQueryBoundaryOwnerState,
  type VireoQueryBoundaryProps,
  type VireoQueryBoundaryStatus,
} from "./VireoQueryBoundary.types";

function useUtilityClasses(ownerState: VireoQueryBoundaryOwnerState, classes?: VireoQueryBoundaryProps["classes"]) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.status === "loading" && "loading",
        ownerState.status === "error" && "error",
        ownerState.hasErrorDetails && "hasErrorDetails",
      ],
      loadingIndicator: ["loadingIndicator"],
      errorAlert: ["errorAlert"],
      actions: ["actions"],
      retryButton: ["retryButton"],
      errorDetailsButton: ["errorDetailsButton"],
      errorDetailsDialog: ["errorDetailsDialog"],
    } as const satisfies UtilityClassSlotMap<VireoQueryBoundarySlotName, VireoQueryBoundaryClassKey>,
    getVireoQueryBoundaryUtilityClass,
    classes,
  );
}

function safelyResolveRetryable(retryable: VireoQueryBoundaryProps["retryable"], error: unknown): boolean {
  if (typeof retryable !== "function") return retryable ?? true;
  try {
    return retryable(error);
  } catch {
    return false;
  }
}

function safelySelectErrorDetails(selector: VireoQueryBoundaryProps["selectErrorDetails"], error: unknown): unknown {
  if (!selector) return undefined;
  try {
    return selector(error);
  } catch {
    return undefined;
  }
}

type FallbackProps = Omit<VireoQueryBoundaryProps, "children" | "errorFallback" | "loadingFallback" | "resetKeys"> & {
  error?: unknown;
  retry?: () => void;
  status: VireoQueryBoundaryStatus;
};

const VireoQueryBoundaryFallback = React.forwardRef<HTMLDivElement, FallbackProps>(
  function VireoQueryBoundaryFallback(props, forwardedRef) {
    const {
      className,
      classes: classesProp,
      closeErrorDetailsLabel = "Close error details",
      copiedErrorDetailsLabel = "Error details copied",
      copyErrorDetailsLabel = "Copy error details",
      error,
      errorDetailsLabel = "Show error details",
      errorDetailsTitle = "Error details",
      errorMessage = "The requested content could not be loaded.",
      errorTitle = "Something went wrong",
      loadingLabel = "Loading",
      loadingRevealDelay,
      announceLoading = true,
      onRetry,
      retry,
      retryLabel = "Retry",
      retryable: retryableProp = true,
      selectErrorDetails,
      slotProps = {},
      slots = {},
      status,
      style,
      sx,
      ...other
    } = props;
    const retryable = status === "error" && safelyResolveRetryable(retryableProp, error);
    const errorDetails = React.useMemo(
      () => (status === "error" ? safelySelectErrorDetails(selectErrorDetails, error) : undefined),
      [error, selectErrorDetails, status],
    );
    const hasErrorDetails = errorDetails !== null && errorDetails !== undefined;
    const ownerState: VireoQueryBoundaryOwnerState = { status, hasErrorDetails, retryable };
    const classes = useUtilityClasses(ownerState, classesProp);
    const [detailsOpen, setDetailsOpen] = React.useState(false);
    const detailsTitleId = React.useId();

    React.useEffect(() => setDetailsOpen(false), [error]);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedLoadingIndicatorSlotProps = resolveSlotProps(slotProps.loadingIndicator, ownerState);
    const resolvedErrorAlertSlotProps = resolveSlotProps(slotProps.errorAlert, ownerState);
    const resolvedActionsSlotProps = resolveSlotProps(slotProps.actions, ownerState);
    const resolvedRetryButtonSlotProps = resolveSlotProps(slotProps.retryButton, ownerState);
    const resolvedErrorDetailsButtonSlotProps = resolveSlotProps(slotProps.errorDetailsButton, ownerState);
    const resolvedErrorDetailsDialogSlotProps = resolveSlotProps(slotProps.errorDetailsDialog, ownerState);

    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const { className: loadingClassName, size: loadingSize, ...loadingOther } = resolvedLoadingIndicatorSlotProps;
    const { className: alertClassName, ...alertOther } = resolvedErrorAlertSlotProps;
    const { className: actionsClassName, sx: actionsSx, ...actionsOther } = resolvedActionsSlotProps;
    const { className: retryClassName, onClick: retrySlotOnClick, ...retryOther } = resolvedRetryButtonSlotProps;
    const {
      className: detailsButtonClassName,
      onClick: detailsButtonSlotOnClick,
      ...detailsButtonOther
    } = resolvedErrorDetailsButtonSlotProps;
    const {
      className: dialogClassName,
      onClose: dialogSlotOnClose,
      open: _ignoredDialogOpen,
      ...dialogOther
    } = resolvedErrorDetailsDialogSlotProps;
    void _ignoredDialogOpen;

    const handleRetry = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
      event => {
        retrySlotOnClick?.(event);
        if (!event.defaultPrevented && retry) {
          onRetry?.(error);
          retry();
        }
      },
      [error, onRetry, retry, retrySlotOnClick],
    );
    const handleOpenDetails = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
      event => {
        detailsButtonSlotOnClick?.(event);
        if (!event.defaultPrevented) setDetailsOpen(true);
      },
      [detailsButtonSlotOnClick],
    );
    const handleCloseDetails = React.useCallback<NonNullable<DialogProps["onClose"]>>(
      (event, reason) => {
        dialogSlotOnClose?.(event, reason);
        if (!(event as Event).defaultPrevented) setDetailsOpen(false);
      },
      [dialogSlotOnClose],
    );

    return (
      <VireoQueryBoundaryRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {status === "loading" ? (
          <VireoLoadingRegion
            announce={announceLoading}
            loading
            loadingLabel={loadingLabel}
            revealDelay={loadingRevealDelay}
          >
            {({ loadingVisible }) =>
              loadingVisible ? (
                <VireoQueryBoundaryLoadingIndicator
                  {...loadingOther}
                  as={slots.loadingIndicator}
                  ownerState={ownerState}
                  className={joinClassNames(classes.loadingIndicator, loadingClassName)}
                  size={loadingSize ?? "3rem"}
                  aria-hidden="true"
                />
              ) : null
            }
          </VireoLoadingRegion>
        ) : (
          <VireoQueryBoundaryErrorAlert
            severity="error"
            {...alertOther}
            as={slots.errorAlert}
            ownerState={ownerState}
            className={joinClassNames(classes.errorAlert, alertClassName)}
            role="alert"
          >
            <AlertTitle>{errorTitle}</AlertTitle>
            {errorMessage}
            {(retryable || hasErrorDetails) && (
              <VireoQueryBoundaryActions
                direction="row"
                spacing={1}
                {...actionsOther}
                as={slots.actions}
                ownerState={ownerState}
                className={joinClassNames(classes.actions, actionsClassName)}
                sx={mergeSx({ alignItems: "center" }, actionsSx)}
              >
                {retryable && (
                  <VireoQueryBoundaryRetryButton
                    variant="outlined"
                    color="inherit"
                    {...retryOther}
                    as={slots.retryButton}
                    ownerState={ownerState}
                    className={joinClassNames(classes.retryButton, retryClassName)}
                    onClick={handleRetry}
                  >
                    {retryLabel}
                  </VireoQueryBoundaryRetryButton>
                )}
                {hasErrorDetails && (
                  <Tooltip title={errorDetailsLabel}>
                    <VireoQueryBoundaryErrorDetailsButton
                      size="small"
                      {...detailsButtonOther}
                      as={slots.errorDetailsButton}
                      ownerState={ownerState}
                      className={joinClassNames(classes.errorDetailsButton, detailsButtonClassName)}
                      aria-label={errorDetailsLabel}
                      onClick={handleOpenDetails}
                    >
                      <InfoOutlined fontSize="small" />
                    </VireoQueryBoundaryErrorDetailsButton>
                  </Tooltip>
                )}
              </VireoQueryBoundaryActions>
            )}
            {hasErrorDetails && (
              <VireoQueryBoundaryErrorDetailsDialog
                {...dialogOther}
                as={slots.errorDetailsDialog}
                ownerState={ownerState}
                className={joinClassNames(classes.errorDetailsDialog, dialogClassName)}
                open={detailsOpen}
                onClose={handleCloseDetails}
                aria-labelledby={detailsTitleId}
                fullWidth
                maxWidth="md"
              >
                <DialogTitle id={detailsTitleId} sx={{ pr: 7 }}>
                  {errorDetailsTitle}
                  <IconButton
                    aria-label={closeErrorDetailsLabel}
                    onClick={() => setDetailsOpen(false)}
                    sx={{ position: "absolute", right: 8, top: 8 }}
                  >
                    <Close />
                  </IconButton>
                </DialogTitle>
                <DialogContent>
                  <VireoJsonViewer
                    data={errorDetails}
                    copyLabel={copyErrorDetailsLabel}
                    copiedLabel={copiedErrorDetailsLabel}
                  />
                </DialogContent>
              </VireoQueryBoundaryErrorDetailsDialog>
            )}
          </VireoQueryBoundaryErrorAlert>
        )}
      </VireoQueryBoundaryRoot>
    );
  },
);

VireoQueryBoundaryFallback.displayName = `${VIREO_QUERY_BOUNDARY_NAME}Fallback`;

/** Coordinates Suspense loading, descendant errors, and TanStack Query reset semantics in one local boundary. */
export const VireoQueryBoundary = React.forwardRef<HTMLDivElement, VireoQueryBoundaryProps>(
  function VireoQueryBoundary(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_QUERY_BOUNDARY_NAME });
    const {
      children,
      errorFallback,
      loadingFallback,
      onError,
      onRetry,
      resetKeys = [],
      retryable = true,
      ...fallbackProps
    } = props;

    return (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            resetKeys={[...resetKeys]}
            onReset={reset}
            onError={(error, info) => onError?.(error, { componentStack: info.componentStack ?? null })}
            fallbackRender={({ error, resetErrorBoundary }) => {
              const canRetry = safelyResolveRetryable(retryable, error);
              const retry = () => {
                onRetry?.(error);
                resetErrorBoundary();
              };
              if (errorFallback) return errorFallback({ error, retry, retryable: canRetry });
              return (
                <VireoQueryBoundaryFallback
                  {...fallbackProps}
                  onRetry={onRetry}
                  ref={forwardedRef}
                  status="error"
                  error={error}
                  retry={resetErrorBoundary}
                  retryable={retryable}
                />
              );
            }}
          >
            <React.Suspense
              fallback={
                loadingFallback ?? <VireoQueryBoundaryFallback {...fallbackProps} ref={forwardedRef} status="loading" />
              }
            >
              {children}
            </React.Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    );
  },
);

VireoQueryBoundary.displayName = VIREO_QUERY_BOUNDARY_NAME;
