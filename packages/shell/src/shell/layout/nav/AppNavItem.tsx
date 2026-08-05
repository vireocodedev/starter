import { type NavItemEntry } from "@/shell/layout/nav/nav.types";
import {
  collapsedNavIconSx,
  collapsedNavItemSx,
  collapsedNavTextProps,
  collapsedNavTextSx,
  expandedNavIconSx,
  navIcon,
} from "@/shell/layout/nav/nav.utils";
import { Box, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";

export function AppNavItem({
  disabledTooltip,
  entry,
  index,
  isCollapsed,
  itemLabel,
  itemPath,
  mobile,
  onNavigateTo,
  pathname,
}: {
  disabledTooltip?: string;
  entry: NavItemEntry;
  index: number;
  isCollapsed: boolean;
  itemLabel: string;
  itemPath?: string;
  mobile: boolean;
  onNavigateTo: (to: string) => void;
  pathname: string;
}) {
  const itemNode = (
    <ListItemButton
      key={`item-${itemLabel}-${index}`}
      disabled={Boolean(entry.disabled)}
      selected={Boolean(itemPath && pathname === itemPath)}
      onClick={() => {
        if (itemPath && !entry.disabled) {
          onNavigateTo(itemPath);
        }
      }}
      sx={
        isCollapsed
          ? {
              ...collapsedNavItemSx,
              "&.Mui-selected": {
                color: theme => theme.palette.primary[600],
                backgroundColor: theme =>
                  theme.palette.mode === "light" ? theme.palette.primary[100] : alpha(theme.palette.primary[600], 0.16),
                "&:hover": {
                  backgroundColor: theme =>
                    theme.palette.mode === "light"
                      ? theme.palette.primary[200]
                      : alpha(theme.palette.primary[600], 0.22),
                },
              },
            }
          : {
              pl: 2,
              pr: 1.25,
              "&.Mui-selected": {
                color: theme => theme.palette.primary[600],
                backgroundColor: theme =>
                  theme.palette.mode === "light" ? theme.palette.primary[100] : alpha(theme.palette.primary[600], 0.16),
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: theme =>
                    theme.palette.mode === "light"
                      ? theme.palette.primary[200]
                      : alpha(theme.palette.primary[600], 0.22),
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 6,
                  top: 8,
                  bottom: 8,
                  width: 3,
                  borderRadius: 999,
                  backgroundColor: "currentColor",
                },
              },
            }
      }
    >
      <ListItemIcon sx={isCollapsed ? collapsedNavIconSx : expandedNavIconSx}>{navIcon(entry.icon)}</ListItemIcon>
      <ListItemText
        primary={itemLabel}
        sx={isCollapsed ? collapsedNavTextSx : undefined}
        primaryTypographyProps={isCollapsed ? collapsedNavTextProps : undefined}
      />
    </ListItemButton>
  );

  if (disabledTooltip && !mobile) {
    return (
      <Tooltip key={`item-tooltip-${itemLabel}-${index}`} title={disabledTooltip} placement="right">
        <Box component="span" sx={{ display: "block" }}>
          {itemNode}
        </Box>
      </Tooltip>
    );
  }

  return itemNode;
}
