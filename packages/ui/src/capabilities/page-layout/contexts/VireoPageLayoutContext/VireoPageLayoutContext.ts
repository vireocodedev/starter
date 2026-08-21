import type { VireoPageLayout } from "@/capabilities/page-layout/types/pageLayout.types";
import React from "react";

/** Internal page-layout value consumed through useVireoPageLayout. */
export const VireoPageLayoutContext = React.createContext<VireoPageLayout | null>(null);
