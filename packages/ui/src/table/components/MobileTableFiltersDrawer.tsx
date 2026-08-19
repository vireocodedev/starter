import { AppBottomDrawer } from "@/components/AppBottomDrawer";
import { RgoLabelBox } from "@/core/public";
import { RgoInputSelect } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import { type RgoServerTableColumnWithSort, type SortDirection } from "@/table/types";
import { renderDirectionIcon, renderHeader } from "@/table/utils/mobileTable.utils";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, Button, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import React from "react";

export function MobileTableFiltersDrawer<TElement>({
  activeSortDirection,
  activeSortValue,
  filtersCount,
  filtersNode,
  onClearFilters,
  onClose,
  onDone,
  onOpen,
  onSortColumnChange,
  onSortDirectionChange,
  open,
  sortableColumns,
}: {
  activeSortDirection: SortDirection;
  activeSortValue: string;
  filtersCount: number;
  filtersNode?: React.ReactNode;
  onClearFilters?: () => void;
  onClose: () => void;
  onDone?: () => void;
  onOpen: () => void;
  onSortColumnChange: (sortBy: string | null) => void;
  onSortDirectionChange: (event: React.MouseEvent<HTMLElement>, sortDirection: SortDirection | null) => void;
  open: boolean;
  sortableColumns: RgoServerTableColumnWithSort<TElement>[];
}) {
  const { t } = usePlatformTranslation();
  return (
    <AppBottomDrawer open={open} onClose={onClose} onOpen={onOpen} maxHeight="88dvh">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{
          p: "0 1rem 0.5rem 1.5rem",
          borderBottom: "1px solid var(--mui-palette-grey-300)",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {t("common.filters")}
        </Typography>
        <IconButton aria-label={t("common.closeFilters")} onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Stack
        spacing={2}
        sx={theme => ({
          flex: 1,
          overflow: "auto",
          p: "1.5rem",
          backgroundColor: theme.palette.grey[50],
        })}
      >
        {sortableColumns.length > 0 ? (
          <Stack spacing={2}>
            <RgoLabelBox label={t("common.column")}>
              <RgoInputSelect
                disableClearable
                options={sortableColumns}
                value={activeSortValue}
                onChange={onSortColumnChange}
                renderOption={o => renderHeader(o)}
                renderValue={o => o.sort}
              />
            </RgoLabelBox>

            <RgoLabelBox label={t("common.direction")}>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={activeSortDirection}
                onChange={onSortDirectionChange}
                aria-label={t("common.direction")}
              >
                <ToggleButton value="asc" aria-label={t("common.ascendingSortDirection")}>
                  <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75}>
                    {renderDirectionIcon("asc")}
                    <span>{t("common.ascending")}</span>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="desc" aria-label={t("common.descendingSortDirection")}>
                  <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75}>
                    {renderDirectionIcon("desc")}
                    <span>{t("common.descending")}</span>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </RgoLabelBox>
          </Stack>
        ) : null}

        {filtersNode ? <Box width="100%">{filtersNode}</Box> : null}
      </Stack>

      <Box
        display="flex"
        gap={1}
        sx={{
          p: "1rem 1.5rem",
          borderTop: "1px solid var(--mui-palette-grey-300)",
        }}
      >
        <Button
          color="secondary"
          variant="outlined"
          fullWidth
          disabled={filtersCount === 0 || !onClearFilters}
          onClick={onClearFilters}
        >
          {t("common.clearAll")}
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            onDone?.();
            onClose();
          }}
        >
          {t("common.done")}
        </Button>
      </Box>
    </AppBottomDrawer>
  );
}
