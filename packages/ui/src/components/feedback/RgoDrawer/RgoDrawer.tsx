import { Drawer, useTheme } from "@mui/material";
import "./RgoDrawer.css";

export type RgoDrawerProps = {
  open: boolean;
  onClose: () => void;
  temporary?: boolean;
  anchor?: "left" | "right";
  width?: string | number;
  children: React.ReactNode;
  onExited?: () => void;
};

export function RgoDrawer({
  open,
  onClose,
  temporary = false,
  anchor = "right",
  width = "568px",
  children,
  onExited,
}: RgoDrawerProps) {
  const theme = useTheme();
  const variant = temporary ? "temporary" : "persistent";

  const isPersistent = variant === "persistent";

  return (
    <Drawer
      SlideProps={{
        onEnter: () => {
          document.body.style.overflow = "hidden";
        },
        onEntered: () => {
          document.body.style.overflow = "";
        },
        onExit: () => {
          document.body.style.overflow = "hidden";
        },
        onExited: () => {
          onExited?.();
          document.body.style.overflow = "";
        },
      }}
      open={open}
      variant={variant}
      anchor={anchor}
      onClose={onClose}
      slotProps={{
        paper: {
          style: {
            width,
            ...(isPersistent
              ? {
                  position: "relative",
                  height: "100%",
                  boxShadow: "none",
                  backgroundColor: "var(--mui-palette-grey-50)",
                }
              : {}),
          },
          sx: {
            borderLeft: "none !important",
          },
        },
      }}
      style={{
        width: open ? width : 0,
        flexShrink: 0,
        transition: theme.transitions.create("width", {
          easing: open ? theme.transitions.easing.easeOut : theme.transitions.easing.sharp,
          duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      {children}
    </Drawer>
  );
}
