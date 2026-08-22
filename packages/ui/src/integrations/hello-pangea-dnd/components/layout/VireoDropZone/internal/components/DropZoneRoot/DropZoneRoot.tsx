import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import {
  type VireoDropZoneClassKey,
  getVireoDropZoneUtilityClass,
} from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/VireoDropZone.classes";
import type { VireoDropZoneSlotName } from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/VireoDropZone.identity";
import { VireoDropZoneRoot } from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/VireoDropZone.styled";
import type {
  VireoDropZoneOwnerState,
  VireoDropZoneProps,
} from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/VireoDropZone.types";
import type { DroppableProvided, DroppableStateSnapshot } from "@hello-pangea/dnd";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useForkRef } from "@mui/material/utils";
import React from "react";

function useUtilityClasses(ownerState: VireoDropZoneOwnerState, classes?: VireoDropZoneProps["classes"]) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.disabled && "disabled",
        ownerState.dropState === "candidate" && "candidate",
        ownerState.dropState === "over" && "over",
        ownerState.dropState === "rejected" && "rejected",
      ],
    } as const satisfies UtilityClassSlotMap<VireoDropZoneSlotName, VireoDropZoneClassKey>,
    getVireoDropZoneUtilityClass,
    classes,
  );
}

type DropZoneRootProps = Omit<
  VireoDropZoneProps,
  "canDrop" | "disabled" | "disableDefaultFeedback" | "direction" | "group" | "id" | "mode"
> & {
  candidate: boolean;
  disabled: boolean;
  disableDefaultFeedback: boolean;
  direction: "horizontal" | "vertical";
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  mode: VireoDropZoneOwnerState["mode"];
  provided: DroppableProvided;
  rejected: boolean;
  snapshot: DroppableStateSnapshot;
};

export function DropZoneRoot({
  candidate,
  children,
  className,
  classes: classesProp,
  disabled,
  disableDefaultFeedback,
  direction,
  forwardedRef,
  mode,
  provided,
  rejected,
  slotProps = {},
  slots = {},
  style,
  sx,
  snapshot,
  ...other
}: DropZoneRootProps) {
  const dropState: VireoDropZoneOwnerState["dropState"] = snapshot.isDraggingOver
    ? "over"
    : rejected
      ? "rejected"
      : candidate
        ? "candidate"
        : "idle";
  const ownerState: VireoDropZoneOwnerState = { direction, disabled, disableDefaultFeedback, dropState, mode };
  const classes = useUtilityClasses(ownerState, classesProp);
  const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
  const {
    className: rootSlotClassName,
    ref: rootSlotRef,
    style: rootSlotStyle,
    sx: rootSlotSx,
    ...rootSlotOther
  } = resolvedRootSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef, provided.innerRef);

  return (
    <VireoDropZoneRoot
      {...other}
      {...rootSlotOther}
      {...provided.droppableProps}
      as={slots.root ?? "div"}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootSlotClassName)}
      data-drop-mode={mode}
      data-drop-state={dropState}
      style={{ ...style, ...rootSlotStyle }}
      sx={mergeSx(sx, rootSlotSx)}
    >
      {children}
      {mode === "reorder" && provided.placeholder}
    </VireoDropZoneRoot>
  );
}
