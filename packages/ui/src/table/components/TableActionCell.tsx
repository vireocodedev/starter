import { Box, IconButton, Tooltip, type IconButtonProps } from "@mui/material";
import { RgoIcon } from "@/components/data-display/RgoIcon/RgoIcon";
import { useRgoConfirm } from "@/hooks/useRgoConfirm/useRgoConfirm";
import React from "react";

export type TableActionCellProps = {
  children: React.ReactNode;
};

export type TableActionIconButtonProps = Omit<IconButtonProps, "aria-label" | "children"> & {
  icon: React.ComponentProps<typeof RgoIcon>["icon"];
  label: string;
  tooltip?: React.ReactNode;
  disabledTooltip?: React.ReactNode;
};

export type ConfirmTableActionIconButtonProps = Omit<TableActionIconButtonProps, "onClick"> & {
  confirmTitle: string;
  confirmMessage: string;
  confirmText: string;
  confirmColor?: "error" | "warning";
  onConfirm: () => void;
};

export function TableActionCell({ children }: TableActionCellProps) {
  return (
    <Box display="flex" justifyContent="center">
      {children}
    </Box>
  );
}

export function TableActionIconButton({
  icon,
  label,
  tooltip,
  disabledTooltip,
  disabled,
  ...iconButtonProps
}: TableActionIconButtonProps) {
  const tooltipTitle = disabled && disabledTooltip ? disabledTooltip : tooltip;
  const button = (
    <IconButton aria-label={label} disabled={disabled} {...iconButtonProps}>
      <RgoIcon icon={icon} />
    </IconButton>
  );

  if (!tooltipTitle) {
    return button;
  }

  return (
    <Tooltip title={tooltipTitle}>
      <span>{button}</span>
    </Tooltip>
  );
}

export function ConfirmTableActionIconButton({
  confirmTitle,
  confirmMessage,
  confirmText,
  confirmColor,
  onConfirm,
  ...actionButtonProps
}: ConfirmTableActionIconButtonProps) {
  const confirm = useRgoConfirm();

  return (
    <TableActionIconButton
      {...actionButtonProps}
      onClick={() => {
        confirm({
          title: confirmTitle,
          message: confirmMessage,
          confirmText,
          color: confirmColor,
          onConfirm,
        });
      }}
    />
  );
}
