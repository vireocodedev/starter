import type {
  VireoDndDropProposal,
  VireoDndMode,
  VireoDndState,
  VireoDropZoneId,
} from "@/integrations/hello-pangea-dnd/types/dnd.types";
import React from "react";

export type VireoDndZoneRegistration = {
  id: VireoDropZoneId;
  mode: VireoDndMode;
  group: string;
  disabled: boolean;
  canDrop?: (proposal: VireoDndDropProposal) => boolean;
};

export type VireoDndContextValue = VireoDndState & {
  getZone: (encodedId: string) => VireoDndZoneRegistration | undefined;
  registerDraggable: (encodedId: string) => () => void;
  registerZone: (encodedId: string, registration: VireoDndZoneRegistration) => () => void;
};

export const VireoDndContext = React.createContext<VireoDndContextValue | null>(null);
