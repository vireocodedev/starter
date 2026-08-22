import { useTheme } from "@mui/material/styles";
import React from "react";
import type { VireoThemeColorMetaProps } from "./VireoThemeColorMeta.types";

function findThemeColorMeta(media: string | undefined): HTMLMetaElement | undefined {
  return Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')).find(meta =>
    media === undefined ? !meta.hasAttribute("media") : meta.getAttribute("media") === media,
  );
}

/** Owns one browser theme-color meta tag without disturbing other media-specific variants. */
export function VireoThemeColorMeta({ color, media: mediaProp }: VireoThemeColorMetaProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.palette.background.paper;
  const media = mediaProp?.trim() || undefined;

  React.useEffect(() => {
    const existing = findThemeColorMeta(media);
    const meta = existing ?? document.createElement("meta");
    const hadContent = meta.hasAttribute("content");
    const previousContent = meta.getAttribute("content");

    if (!existing) {
      meta.setAttribute("name", "theme-color");
      if (media) meta.setAttribute("media", media);
      document.head.append(meta);
    }
    meta.setAttribute("content", resolvedColor);

    return () => {
      if (!existing) {
        meta.remove();
      } else if (hadContent) {
        meta.setAttribute("content", previousContent ?? "");
      } else {
        meta.removeAttribute("content");
      }
    };
  }, [media, resolvedColor]);

  return null;
}

export type { VireoThemeColorMetaProps } from "./VireoThemeColorMeta.types";
