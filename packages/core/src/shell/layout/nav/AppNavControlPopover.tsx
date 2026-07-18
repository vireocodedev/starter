import { type AppShellNavControlConfig } from "@/config/app.config.types";
import { Popover } from "@mui/material";

export function AppNavControlPopover({
  control,
  mobile,
  onClose,
  openControl,
}: {
  control: AppShellNavControlConfig | undefined;
  mobile: boolean;
  onClose: () => void;
  openControl: { id: string; anchorEl: HTMLElement } | null;
}) {
  const ControlComponent = control?.Component;

  if (!ControlComponent) {
    return null;
  }

  return (
    <Popover
      open={Boolean(openControl)}
      anchorEl={openControl?.anchorEl ?? null}
      onClose={onClose}
      anchorOrigin={
        mobile
          ? {
              vertical: "top",
              horizontal: "left",
            }
          : {
              vertical: "center",
              horizontal: "right",
            }
      }
      transformOrigin={
        mobile
          ? {
              vertical: "bottom",
              horizontal: "left",
            }
          : {
              vertical: "center",
              horizontal: "left",
            }
      }
      slotProps={{
        paper: {
          sx: {
            width: "calc(100% - 16px)",
            maxWidth: 360,
            mt: mobile ? -1 : 0,
            ml: mobile ? -1 : 2,
          },
        },
      }}
    >
      <ControlComponent collapsed={false} onClose={onClose} />
    </Popover>
  );
}
