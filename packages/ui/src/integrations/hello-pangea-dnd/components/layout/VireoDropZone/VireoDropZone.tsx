"use client";

import { VireoDndContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDndContext/VireoDndContext";
import { encodeDndIdentifier } from "@/integrations/hello-pangea-dnd/utils/dndIdCodec";
import { DropZoneRoot } from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone/internal/components/DropZoneRoot";
import { Droppable } from "@hello-pangea/dnd";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { VIREO_DROP_ZONE_NAME } from "./VireoDropZone.identity";
import type { VireoDropZoneProps } from "./VireoDropZone.types";

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
          <DropZoneRoot
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
