import { Box } from "@mui/material";
import React from "react";

export type AppSkipToContentLinkProps = {
  label: string;
  targetId?: string;
};

/**
 * Accessible "skip to main content" link. Visually hidden off-screen until it
 * receives keyboard focus, then slides into view above the app shell so
 * keyboard/screen-reader users can bypass the header + navigation landmarks.
 *
 * Focus is moved to the target element explicitly on click/activation instead
 * of relying on the browser's native hash-navigation focus behavior, which is
 * inconsistent across browsers/assistive tech for non-interactive targets.
 */
export function AppSkipToContentLink({ label, targetId = "main-content" }: AppSkipToContentLinkProps) {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.focus();
      target.scrollIntoView?.({ block: "start" });
    },
    [targetId],
  );

  return (
    <Box
      component="a"
      href={`#${targetId}`}
      onClick={handleClick}
      sx={{
        position: "fixed",
        top: 8,
        left: 8,
        transform: "translateY(-150%)",
        zIndex: theme => theme.zIndex.tooltip + 1,
        px: 2,
        py: 1,
        bgcolor: "background.paper",
        color: "text.primary",
        borderRadius: 1,
        boxShadow: 3,
        typography: "button",
        textDecoration: "none",
        transition: "transform 0.15s ease-in-out",
        "&:focus-visible, &:focus": {
          transform: "translateY(0)",
        },
      }}
    >
      {label}
    </Box>
  );
}
