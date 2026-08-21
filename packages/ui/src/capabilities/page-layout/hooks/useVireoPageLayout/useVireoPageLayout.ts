import { VireoPageLayoutContext } from "@/capabilities/page-layout/contexts/VireoPageLayoutContext/VireoPageLayoutContext";
import type { VireoPageLayout } from "@/capabilities/page-layout/types/pageLayout.types";
import { createVireoPageLayout } from "@/capabilities/page-layout/utils/pageLayout.utils";
import { useMediaQuery, useTheme } from "@mui/material";
import React from "react";

/** Returns the nearest container-aware page mode, with a viewport fallback outside VireoPage. */
export function useVireoPageLayout(): VireoPageLayout {
  const context = React.useContext(VireoPageLayoutContext);
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("sm"));
  return context ?? createVireoPageLayout(compact ? "compact" : "regular");
}
