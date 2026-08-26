import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { VIREO_LOADING_TOKENS } from "@/core/constants/loading.constants";
import { type VireoLoadingRegionClassKey, getVireoLoadingRegionUtilityClass } from "./VireoLoadingRegion.classes";
import { VIREO_LOADING_REGION_NAME, type VireoLoadingRegionSlotName } from "./VireoLoadingRegion.identity";
import { VireoLoadingRegionRoot, VireoLoadingRegionStatus } from "./VireoLoadingRegion.styled";
import { type VireoLoadingRegionOwnerState, type VireoLoadingRegionProps } from "./VireoLoadingRegion.types";

function useUtilityClasses(ownerState: VireoLoadingRegionOwnerState, classes?: VireoLoadingRegionProps["classes"]) {
  return composeClasses(
    {
      root: ["root", ownerState.loading && "loading", ownerState.loadingVisible && "loadingVisible"],
      status: ["status"],
    } as const satisfies UtilityClassSlotMap<VireoLoadingRegionSlotName, VireoLoadingRegionClassKey>,
    getVireoLoadingRegionUtilityClass,
    classes,
  );
}

/** Owns reveal timing, busy semantics, and one polite announcement for a loading region. */
export const VireoLoadingRegion = React.forwardRef<HTMLDivElement, VireoLoadingRegionProps>(
  function VireoLoadingRegion(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_LOADING_REGION_NAME });
    const {
      announce = true,
      children,
      className,
      classes: classesProp,
      loading,
      loadingLabel,
      revealDelay = VIREO_LOADING_TOKENS.revealDelay,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const normalizedRevealDelay = Math.max(0, revealDelay);
    const [delayedLoadingVisible, setDelayedLoadingVisible] = React.useState(loading && normalizedRevealDelay === 0);

    React.useEffect(() => {
      if (!loading) {
        setDelayedLoadingVisible(false);
        return undefined;
      }

      if (normalizedRevealDelay === 0) {
        setDelayedLoadingVisible(true);
        return undefined;
      }

      setDelayedLoadingVisible(false);
      const timer = window.setTimeout(() => setDelayedLoadingVisible(true), normalizedRevealDelay);
      return () => window.clearTimeout(timer);
    }, [loading, normalizedRevealDelay]);

    const loadingVisible = loading && delayedLoadingVisible;

    const ownerState: VireoLoadingRegionOwnerState = {
      announce,
      loading,
      loadingVisible,
      revealDelay: normalizedRevealDelay,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const resolvedStatusSlotProps = resolveSlotProps(slotProps.status, ownerState);
    const {
      className: statusSlotClassName,
      ref: statusSlotRef,
      style: statusSlotStyle,
      sx: statusSlotSx,
      ...statusSlotOther
    } = resolvedStatusSlotProps;

    const content = typeof children === "function" ? children({ loading, loadingVisible }) : children;

    return (
      <VireoLoadingRegionRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        aria-busy={loading ? "true" : "false"}
        data-loading-state={loadingVisible ? "visible" : loading ? "pending" : "idle"}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {content}
        {announce && loadingVisible ? (
          <VireoLoadingRegionStatus
            {...statusSlotOther}
            as={slots.status ?? "span"}
            ref={statusSlotRef}
            ownerState={ownerState}
            className={joinClassNames(classes.status, statusSlotClassName)}
            style={statusSlotStyle}
            sx={statusSlotSx}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {loadingLabel}
          </VireoLoadingRegionStatus>
        ) : null}
      </VireoLoadingRegionRoot>
    );
  },
);

VireoLoadingRegion.displayName = VIREO_LOADING_REGION_NAME;
