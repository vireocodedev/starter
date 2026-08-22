"use client";

import { VireoDndContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDndContext/VireoDndContext";
import { encodeDndIdentifier } from "@/integrations/hello-pangea-dnd/utils/dndIdCodec";
import { DraggableItemRoot } from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem/internal/components/DraggableItemRoot";
import { Draggable } from "@hello-pangea/dnd";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { VIREO_DRAGGABLE_ITEM_NAME } from "./VireoDraggableItem.identity";
import type { VireoDraggableItemProps } from "./VireoDraggableItem.types";

/** Makes one rendered item draggable through its root or an explicit VireoDragHandle. */
export const VireoDraggableItem = React.forwardRef<HTMLDivElement, VireoDraggableItemProps>(
  function VireoDraggableItem(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DRAGGABLE_ITEM_NAME });
    const {
      allowDragFromInteractiveElements = false,
      disabled = false,
      disableDefaultFeedback = false,
      dragHandle = "root",
      id,
      index,
      respectForcePress = true,
      ...rootProps
    } = props;
    const context = React.useContext(VireoDndContext);
    if (!context) throw new Error("VireoDraggableItem must be used within VireoDndProvider.");
    const { registerDraggable } = context;

    const encodedId = React.useMemo(() => encodeDndIdentifier(id, VIREO_DRAGGABLE_ITEM_NAME), [id]);
    React.useEffect(() => registerDraggable(encodedId), [encodedId, registerDraggable]);

    return (
      <Draggable
        draggableId={encodedId}
        index={index}
        isDragDisabled={disabled}
        disableInteractiveElementBlocking={allowDragFromInteractiveElements}
        shouldRespectForcePress={respectForcePress}
      >
        {(provided, snapshot) => (
          <DraggableItemRoot
            {...rootProps}
            disabled={disabled}
            disableDefaultFeedback={disableDefaultFeedback}
            dragHandle={dragHandle}
            forwardedRef={forwardedRef}
            provided={provided}
            snapshot={snapshot}
          />
        )}
      </Draggable>
    );
  },
);

VireoDraggableItem.displayName = VIREO_DRAGGABLE_ITEM_NAME;
