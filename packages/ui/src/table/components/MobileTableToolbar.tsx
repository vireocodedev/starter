import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { Badge, Box, IconButton } from "@mui/material";
import type React from "react";

export function MobileTableToolbar({
  filtersCount,
  onFiltersOpen,
  openFiltersLabel,
  searchNode,
}: {
  filtersCount: number;
  onFiltersOpen: () => void;
  openFiltersLabel: string;
  searchNode?: React.ReactNode;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      p={1.5}
      borderBottom="1px solid var(--mui-palette-grey-300)"
      gap={1}
      sx={{
        flexShrink: 0,
        "& .MuiInputBase-root": {
          height: 40,
        },
      }}
    >
      <Box flex={1} minWidth={0}>
        {searchNode}
      </Box>

      <Badge
        badgeContent={filtersCount}
        color="error"
        invisible={filtersCount === 0}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        max={99}
      >
        <IconButton sx={{ marginRight: "3px" }} aria-label={openFiltersLabel} onClick={onFiltersOpen}>
          <FilterListRoundedIcon />
        </IconButton>
      </Badge>
    </Box>
  );
}
