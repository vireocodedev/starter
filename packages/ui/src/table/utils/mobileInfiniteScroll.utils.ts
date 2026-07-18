export const MOBILE_TABLE_LOAD_MORE_THRESHOLD_PX = 200;

export function isNearScrollEnd(
  { scrollTop, clientHeight, scrollHeight }: Pick<HTMLElement, "scrollTop" | "clientHeight" | "scrollHeight">,
  thresholdPx = MOBILE_TABLE_LOAD_MORE_THRESHOLD_PX,
): boolean {
  return scrollHeight - scrollTop - clientHeight <= thresholdPx;
}
