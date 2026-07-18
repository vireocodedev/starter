import { Box, SwipeableDrawer, type SxProps, type Theme } from "@mui/material";
import { type ReactNode } from "react";

const iOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

export type AppBottomDrawerProps = {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  onOpen?: () => void;
  children: ReactNode;
  /** Fixed drawer height (e.g. "92dvh"). Prefer this OR maxHeight, not both. */
  height?: string;
  /** Maximum drawer height for content-sized drawers (e.g. "88dvh"). */
  maxHeight?: string;
  keepMounted?: boolean;
  useBackdrop?: boolean;
};

/**
 * Bottom sheet drawer with a swipeable grab handle (puller). Swiping the handle
 * or paper downwards closes the drawer, matching native mobile bottom sheets.
 */
export function AppBottomDrawer({
  open,
  onClose,
  onExited,
  onOpen,
  children,
  height,
  maxHeight,
  keepMounted,
  useBackdrop = true,
}: AppBottomDrawerProps) {
  const paperSx: SxProps<Theme> = {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    ...(height ? { height } : {}),
    ...(maxHeight ? { maxHeight } : {}),
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen ?? (() => {})}
      disableSwipeToOpen
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      hideBackdrop={!useBackdrop}
      keepMounted={keepMounted}
      slotProps={{ paper: { sx: paperSx }, transition: { onExited } }}
    >
      <Box
        sx={theme => ({
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          pt: 1,
          pb: 0.5,
          "&::after": {
            content: '""',
            width: 32,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.grey[300],
          },
        })}
      />
      {children}
    </SwipeableDrawer>
  );
}
