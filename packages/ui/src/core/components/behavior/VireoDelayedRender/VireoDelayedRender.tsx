import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoDelayedRenderClassKey, getVireoDelayedRenderUtilityClass } from "./VireoDelayedRender.classes";
import { VIREO_DELAYED_RENDER_NAME, type VireoDelayedRenderSlotName } from "./VireoDelayedRender.identity";
import { VireoDelayedRenderRoot } from "./VireoDelayedRender.styled";
import { type VireoDelayedRenderOwnerState, type VireoDelayedRenderProps } from "./VireoDelayedRender.types";

function useUtilityClasses(_ownerState: VireoDelayedRenderOwnerState, classes?: VireoDelayedRenderProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoDelayedRenderSlotName, VireoDelayedRenderClassKey>,
    getVireoDelayedRenderUtilityClass,
    classes,
  );
}

/**
 * Defers mounting transient fallback content so fast operations do not produce a distracting flash.
 */
export const VireoDelayedRender = React.forwardRef<HTMLDivElement, VireoDelayedRenderProps>(
  function VireoDelayedRender(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DELAYED_RENDER_NAME });
    const {
      children,
      className,
      classes: classesProp,
      delay = 200,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const [shouldRender, setShouldRender] = React.useState(false);
    React.useEffect(() => {
      if (shouldRender) {
        return undefined;
      }

      const timer = window.setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => window.clearTimeout(timer);
    }, [delay, shouldRender]);

    const ownerState: VireoDelayedRenderOwnerState = { delay };
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

    if (!shouldRender) {
      return null;
    }

    return (
      <VireoDelayedRenderRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {children}
      </VireoDelayedRenderRoot>
    );
  },
);

VireoDelayedRender.displayName = VIREO_DELAYED_RENDER_NAME;
