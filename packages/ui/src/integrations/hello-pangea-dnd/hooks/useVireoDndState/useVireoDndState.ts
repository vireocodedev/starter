import { VireoDndContext } from "@/integrations/hello-pangea-dnd/contexts/VireoDndContext/VireoDndContext";
import type { VireoDndState } from "@/integrations/hello-pangea-dnd/types/dnd.types";
import React from "react";

export function useVireoDndState(): VireoDndState {
  const context = React.useContext(VireoDndContext);
  if (!context) throw new Error("useVireoDndState must be used within VireoDndProvider.");
  return { isDragging: context.isDragging, active: context.active, destination: context.destination };
}
