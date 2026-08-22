import type { SxProps, Theme } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";
import { Toaster, type ToasterProps } from "sonner";
import { VIREO_TOASTER_NAME } from "./VireoToaster.identity";
import { type VireoToasterOwnerState } from "./VireoToaster.types";

type SonnerToasterAdapterProps = Omit<ToasterProps, "theme"> & { sonnerTheme: "light" | "dark" };

const SonnerToasterAdapter = React.forwardRef<HTMLElement, SonnerToasterAdapterProps>(function SonnerToasterAdapter(
  { sonnerTheme, ...props },
  ref,
) {
  return React.createElement(Toaster, { ...props, ref, theme: sonnerTheme });
});

type VireoToasterRootProps = SonnerToasterAdapterProps & {
  as?: React.ElementType;
  ownerState: VireoToasterOwnerState;
  sx?: SxProps<Theme>;
};

type VireoToasterRootComponent = React.ForwardRefExoticComponent<
  VireoToasterRootProps & React.RefAttributes<HTMLElement>
>;

export const VireoToasterRoot = styled(SonnerToasterAdapter, {
  name: VIREO_TOASTER_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
  shouldForwardProp: prop => prop !== "as" && prop !== "ownerState" && prop !== "sx",
})<{ ownerState: VireoToasterOwnerState }>(({ theme }) => {
  const semanticColors = (color: typeof theme.palette.success) => ({
    background: alpha(color.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
    border: alpha(color.main, 0.42),
    text: theme.palette.mode === "dark" ? color.light : color.dark,
  });
  const success = semanticColors(theme.palette.success);
  const info = semanticColors(theme.palette.info);
  const warning = semanticColors(theme.palette.warning);
  const error = semanticColors(theme.palette.error);

  return {
    "--normal-bg": theme.palette.background.paper,
    "--normal-bg-hover": theme.palette.action.hover,
    "--normal-border": theme.palette.divider,
    "--normal-border-hover": theme.palette.action.selected,
    "--normal-text": theme.palette.text.primary,
    "--success-bg": success.background,
    "--success-border": success.border,
    "--success-text": success.text,
    "--info-bg": info.background,
    "--info-border": info.border,
    "--info-text": info.text,
    "--warning-bg": warning.background,
    "--warning-border": warning.border,
    "--warning-text": warning.text,
    "--error-bg": error.background,
    "--error-border": error.border,
    "--error-text": error.text,
    fontFamily: theme.typography.fontFamily,
    "& [data-sonner-toast][data-styled='true']": {
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[6],
      fontFamily: "inherit",
    },
    "& [data-title]": {
      ...theme.typography.body2,
      fontWeight: theme.typography.fontWeightMedium,
    },
    "& [data-description]": theme.typography.caption,
    "& [data-button]": {
      borderRadius: theme.shape.borderRadius,
      fontFamily: "inherit",
      fontWeight: theme.typography.fontWeightMedium,
    },
  };
}) as unknown as VireoToasterRootComponent;
