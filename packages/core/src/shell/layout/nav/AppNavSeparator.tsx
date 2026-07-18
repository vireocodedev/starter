import { type NavSeparatorEntry } from "@/shell/layout/nav/nav.types";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { Box, ListItemButton, Typography } from "@mui/material";

export function AppNavSeparator({
  collapsed,
  entry,
  index,
  label,
  sectionCollapsed,
  onToggleSection,
}: {
  collapsed: boolean;
  entry: NavSeparatorEntry;
  index: number;
  label: string;
  sectionCollapsed: boolean;
  onToggleSection: (sectionId: string) => void;
}) {
  if (collapsed) {
    return (
      <Box key={`sep-${label}-${index}`} sx={{ px: 0.5, py: 0.5, mt: 1 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            display: "block",
            textAlign: "center",
            fontSize: "0.58rem",
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: 0.45,
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  }

  return (
    <ListItemButton
      key={`sep-${entry.id}-${index}`}
      onClick={() => onToggleSection(entry.id)}
      aria-expanded={!sectionCollapsed}
      sx={{
        px: 1,
        py: 0.5,
        mt: 1,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box sx={{ p: 0.25, display: "flex", alignItems: "center", justifyContent: "center", color: "inherit" }}>
        {sectionCollapsed ? (
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        ) : (
          <KeyboardArrowUpRoundedIcon fontSize="small" />
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          textTransform: "uppercase",
          fontWeight: 700,
          letterSpacing: 0.8,
          color: "var(--mui-palette-primary-300)",
        }}
      >
        {label}
      </Typography>
    </ListItemButton>
  );
}
