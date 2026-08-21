import { Box, CircularProgress } from "@mui/material";
import React, { Suspense } from "react";
import "./RgoLoaderSuspense.css";

export type RgoLoaderSuspenseProps = {
  children: React.ReactNode;
  FallbackComponent?: React.ComponentType;
  loaderSize?: string | number;
};

export function RgoLoaderSuspense({ children, FallbackComponent, loaderSize }: RgoLoaderSuspenseProps) {
  const fallback = FallbackComponent ? (
    <FallbackComponent />
  ) : (
    <Box display="grid" width="100%" height="100%" minHeight="inherit" sx={{ placeItems: "center" }}>
      <CircularProgress size={loaderSize ?? "3rem"} />
    </Box>
  );
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
