import { Box, Typography } from "@mui/material";

export type MobileAccordionTitleCellProps = {
  primary: string;
  secondary?: string;
};

/**
 * Two-line collapsed title cell for a mobile accordion summary: a primary line (e.g. invoice
 * number) plus a smaller, muted secondary line (e.g. buyer name). Mirrors
 * `MobileAccordionEndAdornment` so both sides of the summary share one type scale.
 */
export function MobileAccordionTitleCell({ primary, secondary }: MobileAccordionTitleCellProps) {
  return (
    <Box minWidth={0}>
      <Typography variant="body2" fontWeight={600} noWrap>
        {primary}
      </Typography>
      {secondary ? (
        <Typography variant="caption" color="text.secondary" component="div" noWrap>
          {secondary}
        </Typography>
      ) : null}
    </Box>
  );
}

export type MobileAccordionEndAdornmentProps = {
  primary: string;
  secondary?: string;
};

/**
 * Right-aligned, two-line adornment rendered next to a `MobileTableRows` title cell (via
 * `titleEndAdornmentFn`), e.g. a formatted total amount with the issue date underneath.
 */
export function MobileAccordionEndAdornment({ primary, secondary }: MobileAccordionEndAdornmentProps) {
  return (
    <Box minWidth={0} textAlign="right">
      <Typography variant="body2" fontWeight={600} noWrap>
        {primary}
      </Typography>
      {secondary ? (
        <Typography variant="caption" color="text.secondary" component="div" noWrap>
          {secondary}
        </Typography>
      ) : null}
    </Box>
  );
}
