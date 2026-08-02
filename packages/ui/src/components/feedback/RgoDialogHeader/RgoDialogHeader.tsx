import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { composeSx } from "@/utils/muiutils";
import { Close } from "@mui/icons-material";
import { Box, type BoxProps, IconButton, Tooltip } from "@mui/material";
import htmlParse from "html-react-parser";
import React from "react";
import "./RgoDialogHeader.css";

export type RgoDialogHeaderSlotProps = Partial<{
  root: Omit<BoxProps, "children">;
}>;

export type RgoDialogHeaderProps = {
  title?: React.ReactNode;
  color?: "error" | "primary" | "secondary" | "info" | "success" | "warning";
  onClose?: () => void;
  children?: React.ReactNode;
  rgoSlotProps?: RgoDialogHeaderSlotProps;
};

export function RgoDialogHeader({ title, color = undefined, onClose, children, rgoSlotProps }: RgoDialogHeaderProps) {
  const t = useTranslationLocal();

  const rootProps = rgoSlotProps?.root || {};

  return (
    <Box
      {...rootProps}
      sx={composeSx(rootProps.sx, {
        position: "sticky",
        top: 0,
        backgroundColor: "var(--mui-palette-background-paper)",
        zIndex: 1,
        borderBottom: "1px solid var(--mui-palette-grey-300)",
        display: "flex",
        alignItems: "center",
        padding: "12px 16px 12px 24px",
        gap: 2,
      })}
    >
      {title && (
        <Box
          fontWeight={500}
          fontSize="1.25rem"
          lineHeight="1.6"
          sx={theme => ({
            color: color ? theme.palette[color].main : theme.palette.text.primary,
          })}
        >
          {typeof title === "string" ? (
            <Box component="span" sx={{ whiteSpace: "pre-line" }}>
              {htmlParse(title)}
            </Box>
          ) : (
            title
          )}
        </Box>
      )}
      <Box flex="1" display="flex" alignItems="center" flexWrap="nowrap" gap={1}>
        {children}
      </Box>
      {onClose && (
        <Tooltip title={t("common.close")} placement="top">
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={theme => ({
              color: theme.palette.grey[500],
            })}
          >
            <Close />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
