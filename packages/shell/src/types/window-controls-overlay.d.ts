// Window Controls Overlay (PWA desktop titlebar) WebAPI types. Bundled so the
// package's own typecheck sees `navigator.windowControlsOverlay`. Not emitted
// to dist; consuming apps supply their own global augmentation.
interface WindowControlsOverlayGeometryChangeEvent extends Event {
  readonly titlebarAreaRect: DOMRectReadOnly;
}

interface WindowControlsOverlay extends EventTarget {
  readonly visible: boolean;
  getTitlebarAreaRect(): DOMRectReadOnly;
  addEventListener(
    type: "geometrychange",
    listener: (event: WindowControlsOverlayGeometryChangeEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: "geometrychange",
    listener: (event: WindowControlsOverlayGeometryChangeEvent) => void,
    options?: boolean | EventListenerOptions,
  ): void;
}

interface Navigator {
  readonly windowControlsOverlay?: WindowControlsOverlay;
}
