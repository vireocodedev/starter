import { RgoStatusDot, type RgoStatusDotProps } from "@/components/data-display/RgoStatusDot/RgoStatusDot";
import { Box, Popover, Typography } from "@mui/material";
import React from "react";

export type RgoStatusTextProps = {
  label: string;
  color: RgoStatusDotProps["color"];
  tooltip?: string | number | React.ReactNode;
};

/**
 * A status dot followed by a label, with an optional hover popover for more detail.
 */
export function RgoStatusText({ label, color, tooltip }: RgoStatusTextProps) {
  const gap = 0.5;
  const paddingBlock = 1;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        gap={gap}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={{
          paddingTop: paddingBlock,
          paddingBottom: paddingBlock,
        }}
      >
        <RgoStatusDot color={color} />
        <Typography fontSize="12px" fontWeight={500}>
          {label}
        </Typography>
      </Box>

      {tooltip && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: {
                marginLeft: "20px",
              },
            },
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
          sx={{
            pointerEvents: "none",
          }}
        >
          <Box sx={{ p: 1 }}>
            {typeof tooltip === "string" || typeof tooltip === "number" ? <Typography>{tooltip}</Typography> : tooltip}
          </Box>
        </Popover>
      )}
    </>
  );
}
