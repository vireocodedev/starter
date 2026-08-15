import { MobileAccordionSlotContext } from "@/table/mobileAccordionSlot";
import { type DtSortDirection } from "@/components/data-display/RgoTable";
import {
  type ResponsiveTableColumn,
  type ResponsiveTableMobileScrollAnchor,
  type ResponsiveTableProps,
  type ResponsiveTableState,
} from "@/table/responsiveTableState";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AppBottomDrawer } from "@/components/AppBottomDrawer";
import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export function MobileResponsiveTable<
  TItem,
  const TColumns extends readonly ResponsiveTableColumn<NoInfer<TItem>, string>[],
>({ tableProps, state }: { tableProps: ResponsiveTableProps<TItem, TColumns>; state: ResponsiveTableState<TItem> }) {
  const {
    clearFiltersLabel = tableProps.labels.clearFilters,
    data,
    filters,
    filtersCount = 0,
    filtersDoneLabel = tableProps.labels.filtersDone,
    filtersLabel = tableProps.labels.filters,
    getRowKey,
    hasNextPage = false,
    initialExpandedMobileRowKey = null,
    initialMobileScrollAnchor,
    initialMobileScrollTop = 0,
    isFetchingNextPage = false,
    labels,
    layers,
    onClearFilters,
    onExpandedMobileRowKeyChange,
    onLoadNextPage,
    onMobileFiltersDone,
    onMobileScrollTopChange,
    onOpenFilters,
    renderMobileFilters,
    renderMobileSearch,
    renderTitleEndAdornment,
    skeleton = false,
  } = tableProps;
  const {
    endAdornmentColumn,
    handleMobileSortColumnChange,
    handleMobileSortDirectionChange,
    helperColumn,
    mobileDetailColumns,
    resolvedActionsColumn,
    resolvedTitleColumn,
    skeletonPlaceholderCount,
    sortableColumns,
  } = state;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const restoredMobileScrollRef = useRef(false);
  const [expandedMobileRowKey, setExpandedMobileRowKey] = useState<React.Key | null>(initialExpandedMobileRowKey);
  const [mobileViewport, setMobileViewport] = useState<HTMLDivElement | null>(null);
  const [mobileToolbar, setMobileToolbar] = useState<HTMLDivElement | null>(null);
  const [mobileToolbarHeightPx, setMobileToolbarHeightPx] = useState(0);
  const mobileRowVirtualizer = useVirtualizer({
    count: skeleton ? 0 : data.length,
    getScrollElement: () => mobileViewport,
    estimateSize: () => 69,
    getItemKey: index => getRowKey?.(data[index], index) ?? index,
    overscan: 5,
    useAnimationFrameWithResizeObserver: true,
  });

  useEffect(() => {
    if (!mobileToolbar) {
      setMobileToolbarHeightPx(0);
      return;
    }
    setMobileToolbarHeightPx(mobileToolbar.offsetHeight);
    if (!globalThis.ResizeObserver) return;

    const observer = new ResizeObserver(() => setMobileToolbarHeightPx(mobileToolbar.offsetHeight));
    observer.observe(mobileToolbar);
    return () => observer.disconnect();
  }, [mobileToolbar]);

  const mobileVirtualRows = mobileRowVirtualizer.getVirtualItems();
  const lastMobileVirtualRow = mobileVirtualRows.at(-1);

  useEffect(() => {
    if (
      !lastMobileVirtualRow ||
      lastMobileVirtualRow.index < data.length - 1 ||
      !hasNextPage ||
      isFetchingNextPage ||
      !onLoadNextPage
    ) {
      return;
    }
    onLoadNextPage();
  }, [data.length, hasNextPage, isFetchingNextPage, lastMobileVirtualRow, onLoadNextPage]);

  useEffect(() => {
    if (!mobileViewport || restoredMobileScrollRef.current) return;

    if (initialMobileScrollAnchor) {
      const anchorIndex = data.findIndex(
        (item, rowIndex) =>
          String(getRowKey?.(item, rowIndex) ?? rowIndex) === String(initialMobileScrollAnchor.rowKey),
      );

      if (anchorIndex < 0) {
        if (data.length <= initialMobileScrollAnchor.rowIndex && hasNextPage) {
          if (!isFetchingNextPage) onLoadNextPage?.();
          return;
        }
        mobileViewport.scrollTop = initialMobileScrollTop;
        restoredMobileScrollRef.current = true;
        return;
      }

      mobileRowVirtualizer.scrollToIndex(anchorIndex, { align: "start" });
      window.requestAnimationFrame(() => {
        const anchorRow = mobileViewport.querySelector<HTMLElement>(`[data-index="${anchorIndex}"]`);
        if (anchorRow) {
          mobileViewport.scrollTop +=
            anchorRow.getBoundingClientRect().top -
            mobileViewport.getBoundingClientRect().top -
            initialMobileScrollAnchor.offsetTop;
        }
        restoredMobileScrollRef.current = true;
      });
      return;
    }

    mobileViewport.scrollTop = initialMobileScrollTop;
    restoredMobileScrollRef.current = true;
  }, [
    data,
    getRowKey,
    hasNextPage,
    initialMobileScrollAnchor,
    initialMobileScrollTop,
    isFetchingNextPage,
    mobileRowVirtualizer,
    mobileViewport,
    onLoadNextPage,
  ]);

  const handleMobileScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const viewport = event.currentTarget;
      const viewportTop = viewport.getBoundingClientRect().top;
      const firstVisibleItem = mobileRowVirtualizer.getVirtualItems().find(item => {
        const row = viewport.querySelector<HTMLElement>(`[data-index="${item.index}"]`);
        return row ? row.getBoundingClientRect().bottom > viewportTop + mobileToolbarHeightPx : false;
      });
      const row = firstVisibleItem
        ? viewport.querySelector<HTMLElement>(`[data-index="${firstVisibleItem.index}"]`)
        : null;
      const anchor: ResponsiveTableMobileScrollAnchor | undefined =
        firstVisibleItem && row
          ? {
              rowKey: getRowKey?.(data[firstVisibleItem.index], firstVisibleItem.index) ?? firstVisibleItem.index,
              rowIndex: firstVisibleItem.index,
              offsetTop: row.getBoundingClientRect().top - viewportTop,
            }
          : undefined;
      onMobileScrollTopChange?.(viewport.scrollTop, anchor);
    },
    [data, getRowKey, mobileRowVirtualizer, mobileToolbarHeightPx, onMobileScrollTopChange],
  );

  return (
    <Box
      ref={setMobileViewport}
      data-responsive-table-mobile-viewport
      aria-busy={skeleton}
      onScroll={handleMobileScroll}
      sx={{ height: "100%", overflow: "auto", overflowAnchor: "none" }}
    >
      {renderMobileSearch || onOpenFilters || renderMobileFilters ? (
        <Stack
          ref={setMobileToolbar}
          spacing={1}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: layers.stickyToolbar,
            p: 1.5,
            bgcolor: "surface.sunken",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>{renderMobileSearch?.()}</Box>
            {onOpenFilters || renderMobileFilters || sortableColumns.length > 0 ? (
              <Badge
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                badgeContent={filtersCount}
                color="error"
                invisible={filtersCount === 0}
                max={99}
              >
                <IconButton
                  aria-expanded={mobileFiltersOpen}
                  aria-label={filtersLabel}
                  onClick={() => {
                    if (!renderMobileFilters && sortableColumns.length === 0 && onOpenFilters) {
                      onOpenFilters();
                      return;
                    }
                    setMobileFiltersOpen(open => !open);
                  }}
                >
                  <FilterListRoundedIcon />
                </IconButton>
              </Badge>
            ) : null}
          </Stack>
        </Stack>
      ) : null}

      {renderMobileFilters || sortableColumns.length > 0 ? (
        <AppBottomDrawer
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          onOpen={() => setMobileFiltersOpen(true)}
          maxHeight="88dvh"
        >
          <Box sx={{ px: 3, pb: 1, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" fontWeight={700}>
              {filtersLabel}
            </Typography>
          </Box>
          <Stack spacing={2.5} sx={{ flex: 1, overflow: "auto", p: 3, bgcolor: "surface.sunken" }}>
            {sortableColumns.length > 0 ? (
              <Stack spacing={2}>
                <RgoLabelBox label={labels.sortBy}>
                  <Select
                    fullWidth
                    value={sortableColumns.some(column => column.sort === filters.sortBy) ? filters.sortBy : ""}
                    onChange={event => handleMobileSortColumnChange(event.target.value)}
                  >
                    {sortableColumns.map(column => (
                      <MenuItem key={column.id} value={column.sort}>
                        {column.renderHeader()}
                      </MenuItem>
                    ))}
                  </Select>
                </RgoLabelBox>
                <RgoLabelBox label={labels.sortDirection}>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    value={filters.sortDirection}
                    onChange={(_, direction: DtSortDirection | null) => handleMobileSortDirectionChange(direction)}
                    aria-label={labels.sortDirection}
                  >
                    <ToggleButton value="asc" aria-label={labels.ascendingSortDirection}>
                      <ArrowUpwardRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                      {labels.ascending}
                    </ToggleButton>
                    <ToggleButton value="desc" aria-label={labels.descendingSortDirection}>
                      <ArrowDownwardRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                      {labels.descending}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </RgoLabelBox>
              </Stack>
            ) : null}
            {renderMobileFilters?.()}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button
              fullWidth
              color="secondary"
              variant="outlined"
              disabled={!onClearFilters || filtersCount === 0}
              onClick={onClearFilters}
            >
              {clearFiltersLabel}
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onMobileFiltersDone?.();
                setMobileFiltersOpen(false);
              }}
            >
              {filtersDoneLabel}
            </Button>
          </Stack>
        </AppBottomDrawer>
      ) : null}

      {skeleton ? (
        <MobileResponsiveTableSkeleton
          cardCount={skeletonPlaceholderCount}
          hasEndAdornment={Boolean(renderTitleEndAdornment ?? endAdornmentColumn)}
          hasHelper={Boolean(helperColumn)}
          label={labels.loadingTable}
          stickyRowHeaderLayer={layers.stickyRowHeader}
        />
      ) : (
        <Card
          sx={{
            position: "relative",
            height: data.length === 0 ? "auto" : `${mobileRowVirtualizer.getTotalSize()}px`,
            overflow: "clip",
            flexShrink: 0,
            borderRadius: 0,
            ...(data.length === 0 && { border: 0, boxShadow: "none" }),
          }}
        >
          {data.length === 0 ? (
            <Box
              role="status"
              sx={{
                px: 2,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                bgcolor: "surface.sunken",
              }}
            >
              <Typography color="text.secondary">{labels.noData}</Typography>
            </Box>
          ) : (
            mobileVirtualRows.map(virtualRow => {
              const item = data[virtualRow.index];
              const rowIndex = virtualRow.index;
              const rowKey = getRowKey?.(item, rowIndex) ?? rowIndex;
              return (
                <Box
                  key={virtualRow.key}
                  ref={mobileRowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  data-responsive-table-mobile-row={String(rowKey)}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Accordion
                    square
                    disableGutters
                    elevation={0}
                    slotProps={{ transition: { timeout: 0, unmountOnExit: true } }}
                    expanded={expandedMobileRowKey === rowKey}
                    onChange={(_, expanded) => {
                      const nextRowKey = expanded ? rowKey : null;
                      setExpandedMobileRowKey(nextRowKey);
                      onExpandedMobileRowKeyChange?.(nextRowKey);
                      window.requestAnimationFrame(() => mobileRowVirtualizer.measure());
                    }}
                    sx={{
                      overflow: "visible",
                      backgroundColor: "transparent",
                      backgroundImage: "none",
                      borderTop: rowIndex > 0 ? "1px solid var(--mui-palette-grey-300)" : undefined,
                      "&::before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreRoundedIcon />}
                      sx={{
                        minHeight: 68,
                        px: 2,
                        bgcolor: "surface.raised",
                        "& .MuiAccordionSummary-content": {
                          minWidth: 0,
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {resolvedTitleColumn ? (
                          <MobileAccordionSlotContext.Provider value="summary">
                            {resolvedTitleColumn.renderBody(item, rowIndex)}
                          </MobileAccordionSlotContext.Provider>
                        ) : null}
                      </Box>
                      {renderTitleEndAdornment || endAdornmentColumn || helperColumn ? (
                        <Stack spacing={0.25} sx={{ flexShrink: 0, alignItems: "flex-end", textAlign: "right" }}>
                          {renderTitleEndAdornment || endAdornmentColumn ? (
                            <Box sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              {renderTitleEndAdornment
                                ? renderTitleEndAdornment(item, rowIndex)
                                : endAdornmentColumn?.renderBody(item, rowIndex)}
                            </Box>
                          ) : null}
                          {helperColumn ? (
                            <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                              {helperColumn.renderBody(item, rowIndex)}
                            </Box>
                          ) : null}
                        </Stack>
                      ) : null}
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        overflow: "hidden",
                        borderTop: "1px solid var(--mui-palette-grey-300)",
                        bgcolor: "surface.sunken",
                        p: 0,
                      }}
                    >
                      <Stack>
                        {mobileDetailColumns.map(column => (
                          <MobileDataRow
                            key={column.id}
                            label={column.renderHeader()}
                            value={column.renderBody(item, rowIndex)}
                          />
                        ))}
                      </Stack>
                      {resolvedActionsColumn ? (
                        <MobileDataRow
                          label={resolvedActionsColumn.renderHeader()}
                          value={resolvedActionsColumn.renderBody(item, rowIndex)}
                          actions
                        />
                      ) : null}
                    </AccordionDetails>
                  </Accordion>
                </Box>
              );
            })
          )}
        </Card>
      )}

      {!skeleton && (hasNextPage || isFetchingNextPage) ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          {isFetchingNextPage ? <CircularProgress size={22} /> : null}
        </Box>
      ) : null}
    </Box>
  );
}

function MobileResponsiveTableSkeleton({
  cardCount,
  hasEndAdornment,
  hasHelper,
  label,
  stickyRowHeaderLayer,
}: {
  cardCount: number;
  hasEndAdornment: boolean;
  hasHelper: boolean;
  label: string;
  stickyRowHeaderLayer: number;
}) {
  return (
    <Card aria-busy="true" aria-label={label} sx={{ overflow: "clip", flexShrink: 0, borderRadius: 0 }}>
      {Array.from({ length: cardCount }).map((_, cardIndex) => (
        <Box
          key={`mobile-skeleton-${cardIndex}`}
          sx={{
            position: "relative",
            overflow: "visible",
            "&:not(:first-of-type)": { borderTop: "1px solid var(--mui-palette-grey-300)" },
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: stickyRowHeaderLayer,
              display: "flex",
              minHeight: 68,
              alignItems: "center",
              gap: 2,
              px: 2,
              bgcolor: "surface.raised",
            }}
          >
            <Skeleton animation="wave" height={22} variant="rounded" width={`${42 + ((cardIndex * 13) % 24)}%`} />
            {hasEndAdornment || hasHelper ? (
              <Stack spacing={0.5} sx={{ ml: "auto", alignItems: "flex-end" }}>
                {hasEndAdornment ? <Skeleton animation="wave" height={18} width={72} /> : null}
                {hasHelper ? <Skeleton animation="wave" height={14} width={48} /> : null}
              </Stack>
            ) : null}
            <Skeleton animation="wave" height={24} variant="circular" width={24} />
          </Box>
        </Box>
      ))}
    </Card>
  );
}

function MobileDataRow({ label, value, actions = false }: { label: ReactNode; value: ReactNode; actions?: boolean }) {
  if (actions) {
    return (
      <Box
        sx={{
          px: 1,
          py: 0.75,
          borderTop: "1px solid var(--mui-palette-grey-200)",
          "& > .MuiBox-root": {
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(0, 1fr)",
            width: "100%",
            gap: 0.5,
          },
          "& > .MuiBox-root > *": { display: "flex", minWidth: 0 },
          "& .MuiIconButton-root": {
            width: "100%",
            minWidth: 0,
            flexDirection: "column",
            gap: "0.125rem",
            borderRadius: 1,
            px: 0.5,
            py: 0.75,
            "&::after": {
              content: "attr(aria-label)",
              display: "block",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.625rem",
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: "0.01em",
            },
          },
        }}
      >
        {value}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(96px, 0.8fr) minmax(0, 1.2fr)",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 0.625,
      }}
    >
      <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>{label}</Box>
      <Box sx={{ minWidth: 0, justifySelf: "end", textAlign: "right" }}>{value}</Box>
    </Box>
  );
}
