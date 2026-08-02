import { useTheme } from "@mui/material";
import { type RgoProvider } from "@/providers/RgoProviders";
import { useEffect } from "react";

export const AppThemeColorMetaProvider: RgoProvider = ({ children }) => {
  const theme = useTheme();
  const headerBg = theme.palette.background.paper;

  useEffect(() => {
    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    metas.forEach(meta => {
      meta.removeAttribute("media");
      meta.setAttribute("content", headerBg);
    });

    // Remove duplicate tags, keeping only the first one
    metas.forEach((meta, index) => {
      if (index > 0) {
        meta.remove();
      }
    });
  }, [headerBg]);

  return <>{children}</>;
};
