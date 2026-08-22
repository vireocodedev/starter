import { DateFormat, formatDate, formatMonth, getElapsedMilliseconds, getTimestamp } from "@/core/utils/date";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Built from local-time parts so the expectations hold in any TZ: `formatDate`
// renders through dayjs, which also formats in local time.
const LOCAL_TIMESTAMP_MS = new Date(2024, 0, 15, 10, 30).getTime();

describe("formatDate", () => {
  it("renders the client date format by default", () => {
    expect(formatDate(LOCAL_TIMESTAMP_MS)).toBe("15.01.2024");
  });

  it("honours an explicit format", () => {
    expect(formatDate(LOCAL_TIMESTAMP_MS, { format: DateFormat.CLIENT_DATE_TIME })).toBe("15.01.2024 10:30");
    expect(formatDate(LOCAL_TIMESTAMP_MS, { format: DateFormat.API_DATE })).toBe("2024-01-15");
    expect(formatDate(LOCAL_TIMESTAMP_MS, { format: DateFormat.CLIENT_TIME })).toBe("10:30");
  });

  it("scales second-precision timestamps to milliseconds", () => {
    const seconds = LOCAL_TIMESTAMP_MS / 1_000;
    expect(formatDate(seconds, { unit: "seconds" })).toBe("15.01.2024");
  });

  it("returns a dash for null", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("returns a dash for an unrepresentable timestamp", () => {
    expect(formatDate(Number.NaN)).toBe("-");
    expect(formatDate(Number.POSITIVE_INFINITY)).toBe("-");
  });
});

describe("getTimestamp", () => {
  it("returns the epoch milliseconds of a valid date", () => {
    expect(getTimestamp(dayjs(LOCAL_TIMESTAMP_MS))).toBe(LOCAL_TIMESTAMP_MS);
  });

  it("returns null for null and undefined", () => {
    expect(getTimestamp(null)).toBeNull();
    expect(getTimestamp(undefined)).toBeNull();
  });

  it("returns null for an invalid date rather than NaN", () => {
    expect(getTimestamp(dayjs("not-a-date"))).toBeNull();
  });
});

describe("getElapsedMilliseconds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("measures the distance from the start time to now", () => {
    expect(getElapsedMilliseconds(Date.now() - 5_000)).toBe(5_000);
  });

  it("clamps a future start time to zero instead of returning a negative", () => {
    expect(getElapsedMilliseconds(Date.now() + 5_000)).toBe(0);
  });
});

describe("formatMonth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("maps an API month name to a localized full month name", () => {
    expect(formatMonth("JANUARY")).toBe("January");
    expect(formatMonth("DECEMBER")).toBe("December");
  });

  it("returns a dash for null", () => {
    expect(formatMonth(null)).toBe("-");
  });

  it("passes through values that are not month names", () => {
    expect(formatMonth("NOT_A_MONTH")).toBe("NOT_A_MONTH");
    expect(formatMonth("january")).toBe("january");
  });

  it("resolves short months correctly when today is the 31st", () => {
    // `formatMonth` derives from `dayjs()`, which carries today's day-of-month.
    // dayjs clamps rather than overflowing (Jan 31 -> Feb 29), so this pins that
    // behaviour: a naive `Date#setMonth` implementation would report March.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 31, 12, 0, 0));
    expect(formatMonth("FEBRUARY")).toBe("February");
    expect(formatMonth("APRIL")).toBe("April");
    expect(formatMonth("JUNE")).toBe("June");
    expect(formatMonth("SEPTEMBER")).toBe("September");
    expect(formatMonth("NOVEMBER")).toBe("November");
  });
});
