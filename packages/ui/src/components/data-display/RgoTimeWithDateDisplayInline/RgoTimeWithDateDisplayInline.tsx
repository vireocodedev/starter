import { DateFormat, formatDate } from "@/utils/date";
import { Typography, type TypographyProps } from "@mui/material";
import React from "react";

export type RgoTimeWithDateDisplayInlineProps = Omit<TypographyProps, "children"> & {
  timestamp: number | null | undefined;
  fallback?: React.ReactNode;
  /** Separator rendered between the time and the date. Defaults to a bullet. */
  separator?: string;
};

export function RgoTimeWithDateDisplayInline({
  timestamp,
  fallback = "-",
  separator = "•",
  color = "text.secondary",
  ...typographyProps
}: RgoTimeWithDateDisplayInlineProps) {
  if (!timestamp) return <>{fallback}</>;

  const time = formatDate(timestamp, { format: DateFormat.CLIENT_TIME });
  const date = formatDate(timestamp, { format: DateFormat.CLIENT_DATE });

  return (
    <Typography color={color} {...typographyProps}>
      {`${time} ${separator} ${date}`}
    </Typography>
  );
}
