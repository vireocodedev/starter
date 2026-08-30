"use client";

import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { VireoDndContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDndContext/VireoDndContext";
import { encodeDndIdentifier } from "@/integrations/hello-pangea-dnd/utils/dndIdCodec";
import { type DroppableProvided, type DroppableStateSnapshot, Droppable } from "@hello-pangea/dnd";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoDropZoneClassKey, getVireoDropZoneUtilityClass } from "./VireoDropZone.classes";
import { VIREO_DROP_ZONE_NAME, type VireoDropZoneSlotName } from "./VireoDropZone.identity";
import { VireoDropZoneRoot } from "./VireoDropZone.styled";
import type { VireoDropZoneOwnerState, VireoDropZoneProps } from "./VireoDropZone.types";

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

type RenderedDropZoneRootProps = Omit<
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

/** Keeps hook-based slot and ref orchestration legal inside Droppable's render-prop boundary. */
function RenderedDropZoneRoot({
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
}: RenderedDropZoneRootProps) {
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

/** Renders a typed reorder list or transfer destination inside VireoDndProvider. */
export const VireoDropZone = React.forwardRef<HTMLDivElement, VireoDropZoneProps>(
  function VireoDropZone(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DROP_ZONE_NAME });
    const {
      canDrop,
      disabled = false,
      disableDefaultFeedback = false,
      direction = "vertical",
      group = "default",
      id,
      mode,
      ...rootProps
    } = props;
    const context = React.useContext(VireoDndContext);
    if (!context) throw new Error("VireoDropZone must be used within VireoDndProvider.");
    const { active, getZone, isDragging, registerZone } = context;

    const encodedId = React.useMemo(() => encodeDndIdentifier(id, VIREO_DROP_ZONE_NAME), [id]);
    const registration = React.useMemo(
      () => ({ id, mode, group, disabled, canDrop }),
      [canDrop, disabled, group, id, mode],
    );
    React.useEffect(() => registerZone(encodedId, registration), [encodedId, registerZone, registration]);

    const sourceZone = active ? getZone(encodeDndIdentifier(active.source.id, VIREO_DROP_ZONE_NAME)) : undefined;
    const groupCompatible = !active || sourceZone?.group === group;
    const accepted =
      !active ||
      (groupCompatible &&
        !disabled &&
        (canDrop?.({
          draggable: active.draggable,
          source: active.source,
          destination: { id, mode, group },
        }) ??
          true));
    const rejected = isDragging && !accepted;

    return (
      <Droppable droppableId={encodedId} type={group} direction={direction} isDropDisabled={disabled || rejected}>
        {(provided, snapshot) => (
          <RenderedDropZoneRoot
            {...rootProps}
            candidate={isDragging && accepted}
            disabled={disabled}
            disableDefaultFeedback={disableDefaultFeedback}
            direction={direction}
            forwardedRef={forwardedRef}
            mode={mode}
            provided={provided}
            rejected={rejected}
            snapshot={snapshot}
          />
        )}
      </Droppable>
    );
  },
);

VireoDropZone.displayName = VIREO_DROP_ZONE_NAME;
