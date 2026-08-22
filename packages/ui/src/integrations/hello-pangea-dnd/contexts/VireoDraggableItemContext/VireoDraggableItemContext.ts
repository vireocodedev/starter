import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import React from "react";

export type VireoDraggableItemContextValue = {
  disabled: boolean;
  explicitHandle: boolean;
  isDragging: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  registerHandle: () => () => void;
};

export const VireoDraggableItemContext = React.createContext<VireoDraggableItemContextValue | null>(null);
