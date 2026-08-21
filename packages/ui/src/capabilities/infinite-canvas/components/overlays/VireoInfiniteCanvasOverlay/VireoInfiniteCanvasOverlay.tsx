import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoInfiniteCanvasOverlayClassKey,
  getVireoInfiniteCanvasOverlayUtilityClass,
} from "./VireoInfiniteCanvasOverlay.classes";
import {
  VIREO_INFINITE_CANVAS_OVERLAY_NAME,
  type VireoInfiniteCanvasOverlaySlotName,
} from "./VireoInfiniteCanvasOverlay.identity";
import { VireoInfiniteCanvasOverlayContent, VireoInfiniteCanvasOverlayRoot } from "./VireoInfiniteCanvasOverlay.styled";
import type {
  VireoInfiniteCanvasOverlayOwnerState,
  VireoInfiniteCanvasOverlayProps,
} from "./VireoInfiniteCanvasOverlay.types";
function getPositionSx(position: VireoInfiniteCanvasOverlayOwnerState["position"], offset: number) {
  return {
    "top-left": { top: offset, left: offset },
    top: { top: offset, left: "50%", transform: "translateX(-50%)" },
    "top-right": { top: offset, right: offset },
    right: { top: "50%", right: offset, transform: "translateY(-50%)" },
    "bottom-right": { bottom: offset, right: offset },
    bottom: { bottom: offset, left: "50%", transform: "translateX(-50%)" },
    "bottom-left": { bottom: offset, left: offset },
    left: { top: "50%", left: offset, transform: "translateY(-50%)" },
  }[position];
}
function useUtilityClasses(classes?: VireoInfiniteCanvasOverlayProps["classes"]) {
  return composeClasses(
    { root: ["root"], content: ["content"] } as const satisfies UtilityClassSlotMap<
      VireoInfiniteCanvasOverlaySlotName,
      VireoInfiniteCanvasOverlayClassKey
    >,
    getVireoInfiniteCanvasOverlayUtilityClass,
    classes,
  );
}
/** Pins interactive controls above the canvas without applying the world transform. */
export const VireoInfiniteCanvasOverlay = React.forwardRef<HTMLDivElement, VireoInfiniteCanvasOverlayProps>(
  function VireoInfiniteCanvasOverlay(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_INFINITE_CANVAS_OVERLAY_NAME });
    const {
      children,
      className,
      classes: classesProp,
      offset = 16,
      position = "top-right",
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;
    const ownerState: VireoInfiniteCanvasOverlayOwnerState = { position };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const content = resolveSlotProps(slotProps.content, ownerState);
    const ref = useForkRef(forwardedRef, root.ref);
    const Content = slots.content ?? VireoInfiniteCanvasOverlayContent;
    const anchored = getPositionSx(position, offset);
    return (
      <VireoInfiniteCanvasOverlayRoot
        {...other}
        {...root}
        as={slots.root ?? "div"}
        ref={ref}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, root.className)}
        style={{ ...style, ...root.style }}
        sx={mergeSx(sx, root.sx)}
      >
        <Content
          {...content}
          ownerState={ownerState}
          className={joinClassNames(classes.content, content.className)}
          sx={mergeSx(anchored, content.sx)}
          onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
            event.stopPropagation();
            content.onPointerDown?.(event);
          }}
        >
          {children}
        </Content>
      </VireoInfiniteCanvasOverlayRoot>
    );
  },
);
VireoInfiniteCanvasOverlay.displayName = VIREO_INFINITE_CANVAS_OVERLAY_NAME;
