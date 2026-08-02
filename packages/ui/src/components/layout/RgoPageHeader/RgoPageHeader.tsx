import { Box, Typography } from "@mui/material";
import React from "react";
import "./RgoPageHeader.css";

export type RgoPageHeaderProps = {
  title?: React.ReactNode;
  backButton?: React.ReactNode;
  children?: React.ReactNode;
};

export function RgoPageHeader({ title, backButton, children }: RgoPageHeaderProps) {
  return (
    <div className="rgo-page-header">
      <Box display="flex" alignItems="center" gap={1.5}>
        {backButton}
        {title && (
          <Typography fontWeight={600} whiteSpace="nowrap">
            {title}
          </Typography>
        )}
      </Box>
      {children}
    </div>
  );
}
