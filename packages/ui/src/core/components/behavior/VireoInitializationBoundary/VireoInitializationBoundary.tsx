import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { VireoLoadingRegion } from "@/core/components/feedback/VireoLoadingRegion";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoInitializationBoundaryClassKey,
  getVireoInitializationBoundaryUtilityClass,
} from "./VireoInitializationBoundary.classes";
import {
  VIREO_INITIALIZATION_BOUNDARY_NAME,
  type VireoInitializationBoundarySlotName,
} from "./VireoInitializationBoundary.identity";
import {
  VireoInitializationBoundaryLoadingIndicator,
  VireoInitializationBoundaryRoot,
} from "./VireoInitializationBoundary.styled";
import {
  type VireoInitializationBoundaryOwnerState,
  type VireoInitializationBoundaryProps,
} from "./VireoInitializationBoundary.types";

type LifecycleState = {
  initialize: VireoInitializationBoundaryProps["initialize"];
  status: "pending" | "ready" | "error";
  error?: unknown;
};

function reportCleanupError(error: unknown) {
  console.error("VireoInitializationBoundary cleanup failed", error);
}

function useUtilityClasses(
  ownerState: VireoInitializationBoundaryOwnerState,
  classes?: VireoInitializationBoundaryProps["classes"],
) {
  return composeClasses(
    {
      root: ["root", ownerState.status],
      loadingIndicator: ["loadingIndicator"],
    } as const satisfies UtilityClassSlotMap<VireoInitializationBoundarySlotName, VireoInitializationBoundaryClassKey>,
    getVireoInitializationBoundaryUtilityClass,
    classes,
  );
}

/** Gates a subtree until an abortable asynchronous initialization lifecycle is ready. */
export const VireoInitializationBoundary = React.forwardRef<HTMLDivElement, VireoInitializationBoundaryProps>(
  function VireoInitializationBoundary(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_INITIALIZATION_BOUNDARY_NAME });
    const {
      children,
      className,
      classes: classesProp,
      announceLoading = true,
      fallback,
      initialize,
      loadingLabel = "Initializing",
      loadingRevealDelay,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const [lifecycle, setLifecycle] = React.useState<LifecycleState>({ initialize, status: "pending" });
    const currentLifecycle =
      lifecycle.initialize === initialize ? lifecycle : { initialize, status: "pending" as const };

    React.useEffect(() => {
      let disposed = false;
      let cleanup: undefined | (() => void | Promise<void>);
      const controller = new AbortController();

      setLifecycle({ initialize, status: "pending" });
      queueMicrotask(() => {
        if (disposed) return;
        void Promise.resolve(initialize({ signal: controller.signal })).then(
          result => {
            if (typeof result === "function") cleanup = result;
            if (disposed) {
              if (cleanup) void Promise.resolve(cleanup()).catch(reportCleanupError);
              return;
            }
            setLifecycle({ initialize, status: "ready" });
          },
          error => {
            if (!disposed) setLifecycle({ initialize, status: "error", error });
          },
        );
      });

      return () => {
        disposed = true;
        controller.abort();
        if (cleanup) void Promise.resolve(cleanup()).catch(reportCleanupError);
      };
    }, [initialize]);

    if (currentLifecycle.status === "error") throw currentLifecycle.error;

    const ownerState: VireoInitializationBoundaryOwnerState = { status: currentLifecycle.status };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedLoadingIndicatorSlotProps = resolveSlotProps(slotProps.loadingIndicator, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const { className: loadingIndicatorClassName, ...loadingIndicatorOther } = resolvedLoadingIndicatorSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const LoadingIndicator = slots.loadingIndicator ?? VireoInitializationBoundaryLoadingIndicator;

    return (
      <VireoInitializationBoundaryRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        data-vireo-initialization-state={ownerState.status}
      >
        {ownerState.status === "ready" ? (
          children
        ) : (
          <VireoLoadingRegion
            announce={announceLoading}
            loading
            loadingLabel={loadingLabel}
            revealDelay={loadingRevealDelay}
          >
            {({ loadingVisible }) => {
              if (!loadingVisible) return null;
              if (fallback !== undefined) return fallback;
              return (
                <LoadingIndicator
                  {...loadingIndicatorOther}
                  ownerState={ownerState}
                  className={joinClassNames(classes.loadingIndicator, loadingIndicatorClassName)}
                  aria-hidden="true"
                />
              );
            }}
          </VireoLoadingRegion>
        )}
      </VireoInitializationBoundaryRoot>
    );
  },
);

VireoInitializationBoundary.displayName = VIREO_INITIALIZATION_BOUNDARY_NAME;
