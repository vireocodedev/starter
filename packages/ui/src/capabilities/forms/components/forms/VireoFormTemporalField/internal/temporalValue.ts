import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import type {
  VireoFormTemporalFieldError,
  VireoFormTemporalFieldMode,
  VireoFormTemporalFieldPrecision,
} from "@/capabilities/forms/components/forms/VireoFormTemporalField/VireoFormTemporalField.types";

dayjs.extend(utc);

const pad2 = (value: number): string => String(value).padStart(2, "0");

export function temporalModeLabel(mode: VireoFormTemporalFieldMode): string {
  return mode.replace("-", " ");
}

export function parseTemporalValue(mode: VireoFormTemporalFieldMode, value: string | null | undefined): Dayjs | null {
  if (!value) return null;

  let match: RegExpExecArray | null;
  let canonicalValue: string;

  if (mode === "year") {
    match = /^(\d{4})$/.exec(value);
    if (!match) return null;
    canonicalValue = `${value}-01-01T00:00:00`;
  } else if (mode === "month") {
    match = /^(0[1-9]|1[0-2])$/.exec(value);
    if (!match) return null;
    canonicalValue = `2000-${value}-01T00:00:00`;
  } else if (mode === "year-month") {
    match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
    if (!match) return null;
    canonicalValue = `${value}-01T00:00:00`;
  } else if (mode === "date") {
    match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(value);
    if (!match) return null;
    canonicalValue = `${value}T00:00:00`;
  } else if (mode === "time") {
    match = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.exec(value);
    if (!match) return null;
    canonicalValue = `2000-01-01T${value}`;
  } else {
    match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.exec(value);
    if (!match) return null;
    canonicalValue = value;
  }

  const parsed = dayjs.utc(canonicalValue);
  return parsed.isValid() && formatTemporalValue(mode, parsed) === value ? parsed : null;
}

export function formatTemporalValue(mode: VireoFormTemporalFieldMode, value: Dayjs): string {
  const year = String(value.year()).padStart(4, "0");
  const month = pad2(value.month() + 1);
  const date = `${year}-${month}-${pad2(value.date())}`;
  const time = `${pad2(value.hour())}:${pad2(value.minute())}:${pad2(value.second())}`;

  if (mode === "year") return year;
  if (mode === "month") return month;
  if (mode === "year-month") return `${year}-${month}`;
  if (mode === "date") return date;
  if (mode === "time") return time;
  return `${date}T${time}`;
}

export function validateTemporalCandidate(
  mode: VireoFormTemporalFieldMode,
  value: Dayjs | null,
  options: {
    min: Dayjs | null;
    max: Dayjs | null;
    minuteStep: number;
    precision: VireoFormTemporalFieldPrecision;
    secondStep: number;
  },
): VireoFormTemporalFieldError | null {
  if (value === null || !value.isValid()) return "invalid";
  if (options.min && value.isBefore(options.min)) return "min";
  if (options.max && value.isAfter(options.max)) return "max";

  if (mode === "time" || mode === "date-time") {
    if (value.minute() % options.minuteStep !== 0) return "minuteStep";
    if (options.precision === "minute" && value.second() !== 0) return "secondStep";
    if (options.precision === "second" && value.second() % options.secondStep !== 0) return "secondStep";
  }

  return null;
}

export function temporalErrorMessage(
  error: VireoFormTemporalFieldError,
  mode: VireoFormTemporalFieldMode,
  options: {
    max?: string;
    min?: string;
    minuteStep: number;
    precision: VireoFormTemporalFieldPrecision;
    secondStep: number;
  },
): string {
  if (error === "min") return `Enter a ${temporalModeLabel(mode)} on or after ${options.min}.`;
  if (error === "max") return `Enter a ${temporalModeLabel(mode)} on or before ${options.max}.`;
  if (error === "minuteStep") return `Minutes must use ${options.minuteStep}-minute increments.`;
  if (error === "secondStep") {
    return options.precision === "minute"
      ? "Seconds must be 00 when minute precision is used."
      : `Seconds must use ${options.secondStep}-second increments.`;
  }
  return `Enter a valid ${temporalModeLabel(mode)}.`;
}
