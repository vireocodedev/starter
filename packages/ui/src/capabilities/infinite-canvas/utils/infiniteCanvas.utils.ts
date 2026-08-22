import type { VireoCanvasPoint, VireoCanvasTransform } from "@/capabilities/infinite-canvas/types/infiniteCanvas.types";
export function clampCanvasScale(scale: number, minScale: number, maxScale: number) {
  return Math.max(minScale, Math.min(maxScale, scale));
}
export function normalizeCanvasTransform(
  transform: VireoCanvasTransform,
  minScale: number,
  maxScale: number,
): VireoCanvasTransform {
  return { scale: clampCanvasScale(transform.scale, minScale, maxScale), pan: transform.pan };
}
export function zoomCanvasAtPoint(
  transform: VireoCanvasTransform,
  scale: number,
  point: VireoCanvasPoint,
): VireoCanvasTransform {
  const ratio = scale / transform.scale;
  return {
    scale,
    pan: { x: point.x - ratio * (point.x - transform.pan.x), y: point.y - ratio * (point.y - transform.pan.y) },
  };
}
