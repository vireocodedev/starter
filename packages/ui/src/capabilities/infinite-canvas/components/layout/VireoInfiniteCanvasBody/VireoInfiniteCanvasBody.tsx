import { useVireoInfiniteCanvas } from "@/capabilities/infinite-canvas/hooks/useVireoInfiniteCanvas/useVireoInfiniteCanvas";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoInfiniteCanvasBodyClassKey,
  getVireoInfiniteCanvasBodyUtilityClass,
} from "./VireoInfiniteCanvasBody.classes";
import {
  VIREO_INFINITE_CANVAS_BODY_NAME,
  type VireoInfiniteCanvasBodySlotName,
} from "./VireoInfiniteCanvasBody.identity";
import { VireoInfiniteCanvasBodyRoot } from "./VireoInfiniteCanvasBody.styled";
import type { VireoInfiniteCanvasBodyOwnerState, VireoInfiniteCanvasBodyProps } from "./VireoInfiniteCanvasBody.types";
function useUtilityClasses(classes?: VireoInfiniteCanvasBodyProps["classes"]) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<
      VireoInfiniteCanvasBodySlotName,
      VireoInfiniteCanvasBodyClassKey
    >,
    getVireoInfiniteCanvasBodyUtilityClass,
    classes,
  );
}
/** Applies the canvas world transform to positioned content. */
export const VireoInfiniteCanvasBody = React.forwardRef<HTMLDivElement, VireoInfiniteCanvasBodyProps>(
  function VireoInfiniteCanvasBody(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_INFINITE_CANVAS_BODY_NAME });
    const { children, className, classes: classesProp, slotProps = {}, slots = {}, style, sx, ...other } = props;
    const { transform } = useVireoInfiniteCanvas();
    const ownerState: VireoInfiniteCanvasBodyOwnerState = { transform };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const ref = useForkRef(forwardedRef, root.ref);
    return (
      <VireoInfiniteCanvasBodyRoot
        {...other}
        {...root}
        as={slots.root ?? "div"}
        ref={ref}
        ownerState={ownerState}
        data-vireo-canvas-pan-surface=""
        className={joinClassNames(classes.root, className, root.className)}
        style={{ ...style, ...root.style }}
        sx={mergeSx(sx, root.sx)}
      >
        {children}
      </VireoInfiniteCanvasBodyRoot>
    );
  },
);
VireoInfiniteCanvasBody.displayName = VIREO_INFINITE_CANVAS_BODY_NAME;
