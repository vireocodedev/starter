import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoStopwatchClassKey, getVireoStopwatchUtilityClass } from "./VireoStopwatch.classes";
import { VIREO_STOPWATCH_NAME, type VireoStopwatchSlotName } from "./VireoStopwatch.identity";
import { VireoStopwatchRoot } from "./VireoStopwatch.styled";
import {
  type VireoStopwatchOwnerState,
  type VireoStopwatchProps,
  type VireoStopwatchTimestamp,
} from "./VireoStopwatch.types";

const SECOND_MS = 1_000;
const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 60 * MINUTE_SECONDS;
const DAY_SECONDS = 24 * HOUR_SECONDS;
const WEEK_SECONDS = 7 * DAY_SECONDS;
const MONTH_SECONDS = 30 * DAY_SECONDS;
const YEAR_SECONDS = 365 * DAY_SECONDS;

type DurationParts = {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function useUtilityClasses(_ownerState: VireoStopwatchOwnerState, classes?: VireoStopwatchProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoStopwatchSlotName, VireoStopwatchClassKey>,
    getVireoStopwatchUtilityClass,
    classes,
  );
}

function resolveTimestamp(value: VireoStopwatchTimestamp): number | null {
  const timestamp = value instanceof Date ? value.getTime() : value;
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getDurationParts(startTimestamp: number | null, endTimestamp: number | null): DurationParts {
  if (startTimestamp === null || endTimestamp === null || endTimestamp < startTimestamp) {
    return { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let remainingSeconds = Math.floor((endTimestamp - startTimestamp) / SECOND_MS);
  const years = Math.floor(remainingSeconds / YEAR_SECONDS);
  remainingSeconds %= YEAR_SECONDS;
  const months = Math.floor(remainingSeconds / MONTH_SECONDS);
  remainingSeconds %= MONTH_SECONDS;
  const weeks = Math.floor(remainingSeconds / WEEK_SECONDS);
  remainingSeconds %= WEEK_SECONDS;
  const days = Math.floor(remainingSeconds / DAY_SECONDS);
  remainingSeconds %= DAY_SECONDS;
  const hours = Math.floor(remainingSeconds / HOUR_SECONDS);
  remainingSeconds %= HOUR_SECONDS;
  const minutes = Math.floor(remainingSeconds / MINUTE_SECONDS);
  const seconds = remainingSeconds % MINUTE_SECONDS;

  return { years, months, weeks, days, hours, minutes, seconds };
}

function formatDuration(parts: DurationParts): string {
  const leadingUnits = [
    parts.years > 0 ? `${parts.years}y` : null,
    parts.months > 0 ? `${parts.months}mo` : null,
    parts.weeks > 0 ? `${parts.weeks}w` : null,
    parts.days > 0 ? `${parts.days}d` : null,
  ].filter((value): value is string => value !== null);
  const hasHoursSegment = leadingUnits.length > 0 || parts.hours > 0;
  const clock = [
    ...(hasHoursSegment ? [String(parts.hours).padStart(2, "0")] : []),
    String(parts.minutes).padStart(2, "0"),
    String(parts.seconds).padStart(2, "0"),
  ].join(":");

  return [...leadingUnits, clock].join(" ");
}

/**
 * Displays a live or stopped duration measured from a supplied timestamp.
 * Long durations use fixed 365-day years and 30-day months.
 */
export const VireoStopwatch = React.forwardRef<HTMLSpanElement, VireoStopwatchProps>(
  function VireoStopwatch(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_STOPWATCH_NAME });
    const {
      className,
      classes: classesProp,
      endDate,
      label = "Elapsed time",
      slotProps = {},
      slots = {},
      startDate,
      style,
      sx,
      ...other
    } = props;
    const [mountedAt] = React.useState(() => Date.now());
    const [currentTimestamp, setCurrentTimestamp] = React.useState(() => Date.now());
    const hasEndDate = endDate !== undefined && endDate !== null;
    const startTimestamp = startDate === undefined || startDate === null ? mountedAt : resolveTimestamp(startDate);
    const endTimestamp = hasEndDate ? resolveTimestamp(endDate) : null;
    const valid = startTimestamp !== null && (!hasEndDate || endTimestamp !== null);
    const running = valid && !hasEndDate;

    React.useEffect(() => {
      setCurrentTimestamp(Date.now());

      if (!running) {
        return undefined;
      }

      const intervalId = window.setInterval(() => setCurrentTimestamp(Date.now()), SECOND_MS);
      return () => window.clearInterval(intervalId);
    }, [running, startTimestamp]);

    const ownerState: VireoStopwatchOwnerState = { running, valid };
    const classes = useUtilityClasses(ownerState, classesProp);
    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const duration = getDurationParts(startTimestamp, hasEndDate ? endTimestamp : currentTimestamp);
    const formattedDuration = formatDuration(duration);

    return (
      <VireoStopwatchRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "span"}
        ref={rootRef}
        ownerState={ownerState}
        aria-atomic="true"
        aria-label={`${label}: ${formattedDuration}`}
        role="timer"
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {formattedDuration}
      </VireoStopwatchRoot>
    );
  },
);

VireoStopwatch.displayName = VIREO_STOPWATCH_NAME;
