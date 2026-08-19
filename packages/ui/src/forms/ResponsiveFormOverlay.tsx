import {
  ResponsiveOverlayFrame,
  VireoOverlayHeader,
  type ResponsiveOverlayFrameDesktopSidePanelWidth,
  type ResponsiveOverlayFrameProps,
} from "@/capabilities/overlays/public";
import { UnsavedChangesScope, useUnsavedChangesRequestDiscard } from "@/capabilities/unsaved-changes/public";
import { DialogActions, DialogContent, type DialogProps, type SxProps, type Theme } from "@mui/material";
import { useResponsiveProps } from "@/hooks/useResponsiveProps";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import React from "react";

export type FormPartComponent = React.ComponentType<{
  children: React.ReactNode;
}>;

export type ResponsiveFormOverlayFrameProps = Pick<
  ResponsiveOverlayFrameProps,
  | "children"
  | "desktopSidePanelMinContentWidth"
  | "desktopSidePanelMinWidth"
  | "desktopSidePanelSx"
  | "desktopSidePanelWidth"
  | "maxWidth"
  | "mobileHeight"
  | "mobileMaxHeight"
  | "onClose"
  | "onExited"
  | "open"
>;

export type ResponsiveFormOverlayFrameComponent = React.ComponentType<ResponsiveFormOverlayFrameProps>;

export type ResponsiveFormOverlayRenderProps = {
  ContentComponent: FormPartComponent;
  ActionsComponent: FormPartComponent;
  fullHeight: boolean;
  requestClose: () => void;
};

type ResponsiveFormOverlayResolvedProps = Omit<ResponsiveFormOverlayRenderProps, "requestClose"> & {
  header: React.ReactNode;
};

export type ResponsiveFormOverlayProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  closeDisabled?: boolean;
  onExited?: () => void;
  maxWidth?: DialogProps["maxWidth"];
  mobileHeight?: string;
  mobileMaxHeight?: string;
  mobileHeaderRootSx?: SxProps<Theme>;
  desktopSidePanelWidth?: ResponsiveOverlayFrameDesktopSidePanelWidth;
  desktopSidePanelMinWidth?: number;
  desktopSidePanelMinContentWidth?: number;
  desktopSidePanelSx?: SxProps<Theme>;
  FrameComponent?: ResponsiveFormOverlayFrameComponent;
  MobileContentComponent: FormPartComponent;
  MobileActionsComponent: FormPartComponent;
  children: (props: ResponsiveFormOverlayRenderProps) => React.ReactNode;
};

function mergeMobileHeaderSx(sx?: SxProps<Theme>): SxProps<Theme> {
  const baseSx: SxProps<Theme> = {
    "& .MuiIconButton-root": {
      color: "unset",
    },
  };

  if (!sx) {
    return baseSx;
  }

  return (Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx]) as SxProps<Theme>;
}

function DesktopFormContent({ children }: { children: React.ReactNode }) {
  return <DialogContent>{children}</DialogContent>;
}

function DesktopFormActions({ children }: { children: React.ReactNode }) {
  return <DialogActions>{children}</DialogActions>;
}

function ResponsiveFormOverlayContent({
  open,
  title,
  onClose,
  closeDisabled = false,
  onExited,
  maxWidth,
  mobileHeight,
  mobileMaxHeight = "92dvh",
  mobileHeaderRootSx,
  desktopSidePanelWidth,
  desktopSidePanelMinWidth,
  desktopSidePanelMinContentWidth,
  desktopSidePanelSx,
  FrameComponent = ResponsiveOverlayFrame,
  MobileContentComponent,
  MobileActionsComponent,
  children,
}: ResponsiveFormOverlayProps) {
  const t = useTranslationLocal();
  const requestClose = useUnsavedChangesRequestDiscard(onClose, { disabled: closeDisabled });
  const responsive = useResponsiveProps<ResponsiveFormOverlayResolvedProps>({
    mobile: {
      header: (
        <VireoOverlayHeader
          title={title}
          closeLabel={t("common.close")}
          closeDisabled={closeDisabled}
          onClose={requestClose}
          sx={mergeMobileHeaderSx(mobileHeaderRootSx)}
        />
      ),
      ContentComponent: MobileContentComponent,
      ActionsComponent: MobileActionsComponent,
      fullHeight: true,
    },
    desktop: {
      header: (
        <VireoOverlayHeader
          title={title}
          closeLabel={t("common.close")}
          closeDisabled={closeDisabled}
          onClose={requestClose}
        />
      ),
      ContentComponent: DesktopFormContent,
      ActionsComponent: DesktopFormActions,
      fullHeight: false,
    },
  });

  return (
    <FrameComponent
      open={open}
      onClose={requestClose}
      onExited={onExited}
      maxWidth={maxWidth}
      mobileHeight={mobileHeight}
      mobileMaxHeight={mobileMaxHeight}
      desktopSidePanelWidth={desktopSidePanelWidth}
      desktopSidePanelMinWidth={desktopSidePanelMinWidth}
      desktopSidePanelMinContentWidth={desktopSidePanelMinContentWidth}
      desktopSidePanelSx={desktopSidePanelSx}
    >
      {responsive.header}
      {children({ ...responsive, requestClose })}
    </FrameComponent>
  );
}

export function ResponsiveFormOverlay(props: ResponsiveFormOverlayProps) {
  return (
    <UnsavedChangesScope>
      <ResponsiveFormOverlayContent {...props} />
    </UnsavedChangesScope>
  );
}
