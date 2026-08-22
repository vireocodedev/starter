import dayjs from "dayjs";

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

export const DateFormat = {
  API_DATE_TIME: "YYYY-MM-DDTHH:mm",
  API_DATE: "YYYY-MM-DD",
  API_TIME: "HH:mm",

  CLIENT_DATE_TIME: "DD.MM.YYYY HH:mm",
  CLIENT_DATE: "DD.MM.YYYY",
  CLIENT_TIME: "HH:mm",
} as const;

export type DateFormat = (typeof DateFormat)[keyof typeof DateFormat];

export type DateFormatConfig = Partial<{
  format: DateFormat;
  unit: "seconds" | "milliseconds";
}>;

export function formatDate(timestamp: number | null, config?: DateFormatConfig): string {
  if (timestamp === null) return "-";
  const format = config?.format || DateFormat.CLIENT_DATE;
  const unit = config?.unit || "milliseconds";
  const timestampMs = Math.floor(unit === "seconds" ? timestamp * 1_000 : timestamp);
  const date = dayjs(timestampMs);
  if (!date.isValid()) return "-";
  return date.format(format);
}

export function getTimestamp(date: dayjs.Dayjs | null | undefined): number | null {
  return date ? (date.isValid() ? date.valueOf() : null) : null;
}

/**
 * Calculates the difference in milliseconds between now and the provided start time.
 * @param start - The start time as a Date object or a timestamp (number).
 * @returns The number of milliseconds elapsed since the start time.
 */
export function getElapsedMilliseconds(start: number): number {
  const diff = Date.now() - start;
  return diff < 0 ? 0 : diff;
}

/**
 * Formats an uppercase English month name (e.g. `"JANUARY"`) into a localized
 * full month name via `dayjs`. Returns `"-"` for `null`, and the original
 * string when the value is not a recognized month.
 */
export function formatMonth(month: string | null): string {
  if (month === null) return "-";
  const index = MONTH_NAMES.indexOf(month as (typeof MONTH_NAMES)[number]);
  return index === -1 ? month : dayjs().month(index).format("MMMM");
}
