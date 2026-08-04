import { useResponsiveProps } from "@/hooks/useResponsiveProps";
import { createAppPageContentLayout } from "@/layout/AppPageContentLayout.utils";
import { AppPageContentLayoutContext, type AppPageContentLayout } from "@/layout/AppPageContentLayoutContext";
import React from "react";

export function useAppPageContentLayout(): AppPageContentLayout {
  const context = React.useContext(AppPageContentLayoutContext);
  const fallback = useResponsiveProps<AppPageContentLayout>({
    mobile: createAppPageContentLayout("compact"),
    desktop: createAppPageContentLayout("regular"),
  });

  return context ?? fallback;
}
