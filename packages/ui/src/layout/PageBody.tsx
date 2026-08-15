import { Box, Container } from "@mui/material";
import React from "react";

export function PageFrame({ children }: React.PropsWithChildren) {
  return (
    <Box
      className="app-page"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

export type PageBodyProps = {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  drawer?: React.ReactNode;
  isCompact: boolean;
  /** Keep page padding in compact mode for content that should remain card-like. */
  enablePaddingOnCompact?: boolean;
};

export function PageBody({
  children,
  maxWidth = false,
  drawer,
  isCompact,
  enablePaddingOnCompact = false,
}: PageBodyProps) {
  const containerPaddingSpacer = enablePaddingOnCompact ? (isCompact ? 2 : 3) : 3;

  return (
    <Box
      sx={{
        display: "flex",
        flex: "1 1 auto",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          position: "relative",
        }}
      >
        <Container
          maxWidth={maxWidth}
          sx={{
            paddingTop: `calc(${containerPaddingSpacer} * var(--mui-spacing)) !important`,
            paddingBottom: `calc(${containerPaddingSpacer} * var(--mui-spacing)) !important`,
            paddingLeft: `calc(${containerPaddingSpacer} * var(--mui-spacing)) !important`,
            paddingRight: `calc(${containerPaddingSpacer} * var(--mui-spacing)) !important`,
            ...(isCompact && !enablePaddingOnCompact ? { padding: "0 !important" } : {}),
            height: "100%",
          }}
        >
          {children}
        </Container>
      </Box>
      {drawer}
    </Box>
  );
}
