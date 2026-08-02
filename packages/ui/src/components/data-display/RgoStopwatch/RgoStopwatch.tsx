import { Box } from "@mui/material";
import React from "react";
import { useStopwatch } from "react-timer-hook";
import "./RgoStopwatch.css";

export type RgoStopwatchProps = {
  startDate?: number | null;
};

function getElapsedTime(startDate: Date, endDate: Date, extraSeconds: number = 0) {
  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs < 0) {
    return { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSecondsFloat = diffMs / 1000 + extraSeconds;
  let totalSeconds = Math.floor(totalSecondsFloat);

  const years = Math.floor(totalSeconds / (365 * 24 * 3600));
  totalSeconds %= 365 * 24 * 3600;

  const months = Math.floor(totalSeconds / (30 * 24 * 3600));
  totalSeconds %= 30 * 24 * 3600;

  const weeks = Math.floor(totalSeconds / (7 * 24 * 3600));
  totalSeconds %= 7 * 24 * 3600;

  const days = Math.floor(totalSeconds / (24 * 3600));
  totalSeconds %= 24 * 3600;

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Check if any value is NaN, return zeros if so
  if (
    isNaN(years) ||
    isNaN(months) ||
    isNaN(weeks) ||
    isNaN(days) ||
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds)
  ) {
    return { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return { years, months, weeks, days, hours, minutes, seconds };
}

export function RgoStopwatch({ startDate }: RgoStopwatchProps) {
  const [currentDate] = React.useState(() => new Date());

  const offsetTimestamp = React.useMemo(
    () => (startDate ? new Date(startDate) : currentDate),
    [startDate, currentDate],
  );

  const { totalSeconds } = useStopwatch({
    autoStart: true,
    offsetTimestamp,
  });

  const { years, months, weeks, days, hours, minutes, seconds } = React.useMemo(
    () => getElapsedTime(offsetTimestamp, currentDate, totalSeconds),
    [offsetTimestamp, currentDate, totalSeconds],
  );

  return (
    <Box fontFamily="Fira Code, monospace" fontSize="1.5ch" sx={{ fontVariantNumeric: "tabular-nums" }}>
      {years > 0 && (
        <>
          <span>{years}</span>
          <span>y </span>
        </>
      )}
      {months > 0 && (
        <>
          <span>{months}</span>
          <span>m </span>
        </>
      )}
      {weeks > 0 && (
        <>
          <span>{weeks}</span>
          <span>w </span>
        </>
      )}
      {days > 0 && (
        <>
          <span>{days}</span>
          <span>d </span>
        </>
      )}
      {hours > 0 && (
        <>
          <span>{String(hours).padStart(2, "0")}</span>
          <span>:</span>
        </>
      )}
      <span>{String(minutes).padStart(2, "0")}</span>
      <span>:</span>
      <span>{String(seconds).padStart(2, "0")}</span>
    </Box>
  );
}
