import { DateFormat, formatDate } from "@/utils/date";
import { Box, type BoxProps } from "@mui/material";
import React from "react";

export type RgoTimeWithDateDisplaySlotProps = Partial<{
  root: Omit<BoxProps, "children" | "ref">;
  timeText: Omit<BoxProps<"span">, "children" | "component" | "ref">;
  dateText: Omit<BoxProps<"span">, "children" | "component" | "ref">;
}>;

export type RgoTimeWithDateDisplayProps = {
  timestamp: number | null | undefined;
  fallback?: React.ReactNode;
  slotProps?: RgoTimeWithDateDisplaySlotProps;
};

export function RgoTimeWithDateDisplay({ timestamp, fallback = "-", slotProps }: RgoTimeWithDateDisplayProps) {
  const rootProps = slotProps?.root ?? {};
  const timeTextProps = slotProps?.timeText ?? {};
  const dateTextProps = slotProps?.dateText ?? {};

  if (!timestamp) return <>{fallback}</>;

  return (
    <Box display="flex" flexDirection="column" {...rootProps}>
      <Box component="span" fontWeight={600} fontSize="1rem" {...timeTextProps}>
        {formatDate(timestamp, { format: DateFormat.CLIENT_TIME })}
      </Box>
      <Box component="span" fontSize="0.75rem" color="text.secondary" {...dateTextProps}>
        {formatDate(timestamp, { format: DateFormat.CLIENT_DATE })}
      </Box>
    </Box>
  );
}
