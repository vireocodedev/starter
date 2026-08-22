import type { DragDropContextProps, ResponderProvided } from "@hello-pangea/dnd";
import type { ReactNode } from "react";

export type VireoDndJsonValue =
  string | number | boolean | null | VireoDndJsonValue[] | { [key: string]: VireoDndJsonValue };

export type VireoDndJsonObject = { [key: string]: VireoDndJsonValue };

/** Application-wide draggable identifier registry extended through declaration merging. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VireoDraggableIdRegistry {}

/** Application-wide drop-zone identifier registry extended through declaration merging. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VireoDropZoneIdRegistry {}

type RegisteredIdentifier<TRegistry> = {
  [TType in keyof TRegistry & string]: { type: TType } & TRegistry[TType];
}[keyof TRegistry & string];

type UnregisteredIdentifier = { type: string } & VireoDndJsonObject;

export type VireoDraggableId = keyof VireoDraggableIdRegistry extends never
  ? UnregisteredIdentifier
  : RegisteredIdentifier<VireoDraggableIdRegistry>;

export type VireoDropZoneId = keyof VireoDropZoneIdRegistry extends never
  ? UnregisteredIdentifier
  : RegisteredIdentifier<VireoDropZoneIdRegistry>;

export type VireoDndMode = "reorder" | "transfer";

export type VireoDndLocation = {
  id: VireoDropZoneId;
  index: number;
};

export type VireoDndDropProposal = {
  draggable: VireoDraggableId;
  source: VireoDndLocation;
  destination: {
    id: VireoDropZoneId;
    mode: VireoDndMode;
    group: string;
  };
};

export type VireoDndDragStart = {
  draggable: VireoDraggableId;
  source: VireoDndLocation;
};

export type VireoDndDragUpdate = VireoDndDragStart & {
  destination: (VireoDndLocation & { mode: VireoDndMode }) | null;
};

export type VireoDndDragEndResult = VireoDndDragUpdate & {
  reason: "drop" | "cancel";
};

export type VireoDndState = {
  isDragging: boolean;
  active: VireoDndDragStart | null;
  destination: (VireoDndLocation & { mode: VireoDndMode; accepted: boolean }) | null;
};

export type VireoDndResponderProvided = Pick<ResponderProvided, "announce">;

export type VireoDndProviderProps = Pick<
  DragDropContextProps,
  "autoScrollerOptions" | "dragHandleUsageInstructions" | "enableDefaultSensors" | "nonce" | "sensors"
> & {
  children?: ReactNode;
  onBeforeCapture?: (event: { draggable: VireoDraggableId }) => void;
  onBeforeDragStart?: (event: VireoDndDragStart) => void;
  onDragStart?: (event: VireoDndDragStart, provided: VireoDndResponderProvided) => void;
  onDragUpdate?: (event: VireoDndDragUpdate, provided: VireoDndResponderProvided) => void;
  onDragEnd: (result: VireoDndDragEndResult, provided: VireoDndResponderProvided) => void;
};
