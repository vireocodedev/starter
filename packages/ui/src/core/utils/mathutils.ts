export function rangesOverlap(range1: [number, number], range2: [number, number]): boolean {
  const [x1Left, x1Right] = range1;
  const [x2Left, x2Right] = range2;

  // Check if the ranges do not overlap by comparing their boundaries
  if (x1Right < x2Left || x2Right < x1Left) {
    return false;
  }
  // Otherwise, they do overlap
  return true;
}

export function areNumbersEqual(a: number, b: number, tolerance: number = 0.00000001): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function roundToDecimals(value: number | null, decimals: number = 2): number | null {
  if (value == null) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

const COMPASS_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

export function getCompassDirectionFromDegrees(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  return COMPASS_DIRS[Math.round(normalized / 45) % 8];
}
