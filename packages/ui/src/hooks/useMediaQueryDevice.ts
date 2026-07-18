import { useMediaQuery, useTheme } from "@mui/material";
import React from "react";

type UseMediaQueryDeviceReturn = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export function useMediaQueryDevice(): UseMediaQueryDeviceReturn {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return React.useMemo(
    () => ({
      isMobile,
      isTablet,
      isDesktop,
    }),
    [isMobile, isTablet, isDesktop],
  );
}
