import type {
  VireoResponsiveTableColumn,
  VireoResponsiveTableMobileScrollAnchor,
  VireoResponsiveTableProps,
  VireoResponsiveTableSortDirection,
} from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/VireoResponsiveTable.types";
import type { VireoResponsiveTableState } from "@/capabilities/table/responsive-table/components/data-display/VireoResponsiveTable/internal/hooks/useVireoResponsiveTableState/useVireoResponsiveTableState";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
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
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { VireoBottomDrawer } from "@/capabilities/overlays/public";
import { mergeSx, VireoLabelBox, VireoSkeleton } from "@/core/public";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type MobileResponsiveTableRowProps<TItem> = {
  endAdornmentColumn?: VireoResponsiveTableColumn<TItem, string>;
  helperColumn?: VireoResponsiveTableColumn<TItem, string>;
  initialExpandedMobileRowKey: React.Key | null;
  item: TItem;
  mobileDetailColumns: readonly VireoResponsiveTableColumn<TItem, string>[];
  mobileViewport: HTMLDivElement | null;
  onExpandedMobileRowKeyChange?: (rowKey: React.Key | null) => void;
  renderTitleEndAdornment?: (item: TItem, rowIndex: number) => ReactNode;
  requestNextPageIfNeeded: (viewport: HTMLDivElement) => void;
  resolvedActionsColumn?: VireoResponsiveTableColumn<TItem, string>;
  resolvedTitleColumn?: VireoResponsiveTableColumn<TItem, string>;
  rowIndex: number;
  rowKey: React.Key;
  rowSx?: SxProps<Theme>;
};

const MOBILE_SUMMARY_SX = {
  minHeight: 68,
  px: 2,
  bgcolor: "surface.raised",
  "& .MuiAccordionSummary-content": {
    minWidth: 0,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
  },
} as const;

function getMobileAccordionSx(rowIndex: number, rowSx?: SxProps<Theme>) {
  return mergeSx(
    {
      overflow: "visible",
      backgroundColor: "transparent",
      backgroundImage: "none",
      borderTop: rowIndex > 0 ? 1 : undefined,
      borderColor: "divider",
      "&::before": { display: "none" },
    },
    rowSx,
  );
}

function MobileResponsiveTableRow<TItem>({
  endAdornmentColumn,
  helperColumn,
  initialExpandedMobileRowKey,
  item,
  mobileDetailColumns,
  mobileViewport,
  onExpandedMobileRowKeyChange,
  renderTitleEndAdornment,
  requestNextPageIfNeeded,
  resolvedActionsColumn,
  resolvedTitleColumn,
  rowIndex,
  rowKey,
  rowSx,
}: MobileResponsiveTableRowProps<TItem>) {
  return (
    <Box data-index={rowIndex} data-responsive-table-mobile-row={String(rowKey)}>
      <Accordion
        square
        disableGutters
        elevation={0}
        defaultExpanded={initialExpandedMobileRowKey === rowKey}
        onChange={(_, expanded) => {
          onExpandedMobileRowKeyChange?.(expanded ? rowKey : null);
          window.requestAnimationFrame(() => {
            if (mobileViewport) requestNextPageIfNeeded(mobileViewport);
          });
        }}
        slotProps={{ transition: { unmountOnExit: true } }}
        sx={getMobileAccordionSx(rowIndex, rowSx)}
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={MOBILE_SUMMARY_SX}>
          <Box sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {resolvedTitleColumn?.renderBody(item, rowIndex, { placement: "mobile-summary" })}
          </Box>
          {renderTitleEndAdornment || endAdornmentColumn || helperColumn ? (
            <Stack spacing={0.25} sx={{ flexShrink: 0, alignItems: "flex-end", textAlign: "right" }}>
              {renderTitleEndAdornment || endAdornmentColumn ? (
                <Box sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
                  {renderTitleEndAdornment
                    ? renderTitleEndAdornment(item, rowIndex)
                    : endAdornmentColumn?.renderBody(item, rowIndex, { placement: "mobile-summary" })}
                </Box>
              ) : null}
              {helperColumn ? (
                <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                  {helperColumn.renderBody(item, rowIndex, { placement: "mobile-summary" })}
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </AccordionSummary>
        <AccordionDetails
          sx={{
            overflow: "hidden",
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "surface.sunken",
            p: 0,
          }}
        >
          <Stack>
            {mobileDetailColumns.map(column => (
              <MobileDataRow
                key={column.id}
                label={column.renderHeader()}
                value={column.renderBody(item, rowIndex, { placement: "mobile-detail" })}
              />
            ))}
          </Stack>
          {resolvedActionsColumn ? (
            <MobileDataRow
              label={resolvedActionsColumn.renderHeader()}
              value={resolvedActionsColumn.renderBody(item, rowIndex, { placement: "mobile-detail" })}
              actions
            />
          ) : null}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

const MemoizedMobileResponsiveTableRow = React.memo(MobileResponsiveTableRow) as typeof MobileResponsiveTableRow;

export function MobileResponsiveTable<
  TItem,
  const TColumns extends readonly VireoResponsiveTableColumn<NoInfer<TItem>, string>[],
>({
  tableProps,
  state,
  skeletonVisible,
}: {
  tableProps: VireoResponsiveTableProps<TItem, TColumns>;
  state: VireoResponsiveTableState<TItem>;
  skeletonVisible: boolean;
}) {
  const {
    clearFiltersLabel = tableProps.labels.clearFilters,
    data,
    filters,
    filtersCount = 0,
    filtersDoneLabel = tableProps.labels.filtersDone,
    filtersLabel = tableProps.labels.filters,
    getRowKey,
    getRowSx,
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
    renderEmptyState,
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
  const previousFetchingNextPageRef = useRef(isFetchingNextPage);
  const [nextPageStatus, setNextPageStatus] = useState(isFetchingNextPage ? labels.loadingNextPage : "");
  const restoredMobileScrollRef = useRef(false);
  const [mobileViewport, setMobileViewport] = useState<HTMLDivElement | null>(null);
  const [mobileToolbar, setMobileToolbar] = useState<HTMLDivElement | null>(null);
  const [mobileToolbarHeightPx, setMobileToolbarHeightPx] = useState(0);

  useEffect(() => {
    const wasFetchingNextPage = previousFetchingNextPageRef.current;
    previousFetchingNextPageRef.current = isFetchingNextPage;
    if (isFetchingNextPage) {
      setNextPageStatus(labels.loadingNextPage);
    } else if (wasFetchingNextPage) {
      setNextPageStatus(labels.loadedNextPage);
    }
  }, [isFetchingNextPage, labels.loadedNextPage, labels.loadingNextPage]);

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

  const requestNextPageIfNeeded = useCallback(
    (viewport: HTMLDivElement) => {
      if (!hasNextPage || isFetchingNextPage || !onLoadNextPage) return;
      const remainingScrollDistance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      if (remainingScrollDistance <= 200) onLoadNextPage();
    },
    [hasNextPage, isFetchingNextPage, onLoadNextPage],
  );

  useEffect(() => {
    if (!mobileViewport || skeleton) return;
    const frame = window.requestAnimationFrame(() => requestNextPageIfNeeded(mobileViewport));
    return () => window.cancelAnimationFrame(frame);
  }, [data.length, mobileViewport, requestNextPageIfNeeded, skeleton]);

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
    mobileViewport,
    onLoadNextPage,
  ]);

  const handleMobileScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const viewport = event.currentTarget;
      const viewportTop = viewport.getBoundingClientRect().top;
      const row = Array.from(viewport.querySelectorAll<HTMLElement>("[data-responsive-table-mobile-row]")).find(
        candidate => candidate.getBoundingClientRect().bottom > viewportTop + mobileToolbarHeightPx,
      );
      const rowIndex = row ? Number(row.dataset.index) : undefined;
      const anchor: VireoResponsiveTableMobileScrollAnchor | undefined =
        row && rowIndex !== undefined && Number.isInteger(rowIndex)
          ? {
              rowKey: getRowKey?.(data[rowIndex], rowIndex) ?? rowIndex,
              rowIndex,
              offsetTop: row.getBoundingClientRect().top - viewportTop,
            }
          : undefined;
      onMobileScrollTopChange?.(viewport.scrollTop, anchor);
      requestNextPageIfNeeded(viewport);
    },
    [data, getRowKey, mobileToolbarHeightPx, onMobileScrollTopChange, requestNextPageIfNeeded],
  );

  return (
    <Box
      ref={setMobileViewport}
      data-responsive-table-mobile-viewport
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
        <VireoBottomDrawer
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          onOpen={() => setMobileFiltersOpen(true)}
          maxHeight="88dvh"
        >
          <Box sx={{ px: 3, pb: 1, borderBottom: 1, borderColor: "divider" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              {filtersLabel}
            </Typography>
          </Box>
          <Stack spacing={2.5} sx={{ flex: 1, overflow: "auto", p: 3, bgcolor: "surface.sunken" }}>
            {sortableColumns.length > 0 ? (
              <Stack spacing={2}>
                <VireoLabelBox label={labels.sortBy}>
                  {({ controlProps, labelId }) => (
                    <Select
                      {...controlProps}
                      labelId={labelId}
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
                  )}
                </VireoLabelBox>
                <VireoLabelBox label={labels.sortDirection}>
                  {({ controlProps }) => (
                    <ToggleButtonGroup
                      {...controlProps}
                      exclusive
                      fullWidth
                      value={filters.sortDirection}
                      onChange={(_, direction: VireoResponsiveTableSortDirection | null) =>
                        handleMobileSortDirectionChange(direction)
                      }
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
                  )}
                </VireoLabelBox>
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
        </VireoBottomDrawer>
      ) : null}

      {skeleton ? (
        <MobileResponsiveTableSkeleton
          cardCount={skeletonPlaceholderCount}
          hasEndAdornment={Boolean(renderTitleEndAdornment ?? endAdornmentColumn)}
          hasHelper={Boolean(helperColumn)}
          visible={skeletonVisible}
        />
      ) : (
        <Card
          sx={{
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
              {renderEmptyState?.() ?? <Typography color="text.secondary">{labels.noData}</Typography>}
            </Box>
          ) : (
            data.map((item, rowIndex) => {
              const rowKey = getRowKey?.(item, rowIndex) ?? rowIndex;
              return (
                <MemoizedMobileResponsiveTableRow
                  key={rowKey}
                  endAdornmentColumn={endAdornmentColumn}
                  helperColumn={helperColumn}
                  initialExpandedMobileRowKey={initialExpandedMobileRowKey}
                  item={item}
                  mobileDetailColumns={mobileDetailColumns}
                  mobileViewport={mobileViewport}
                  onExpandedMobileRowKeyChange={onExpandedMobileRowKeyChange}
                  renderTitleEndAdornment={renderTitleEndAdornment}
                  requestNextPageIfNeeded={requestNextPageIfNeeded}
                  resolvedActionsColumn={resolvedActionsColumn}
                  resolvedTitleColumn={resolvedTitleColumn}
                  rowIndex={rowIndex}
                  rowKey={rowKey}
                  rowSx={getRowSx?.(item, rowIndex, "mobile")}
                />
              );
            })
          )}
        </Card>
      )}

      {!skeleton && (hasNextPage || isFetchingNextPage) ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          {isFetchingNextPage ? <CircularProgress aria-label={labels.loadingNextPage} size={22} /> : null}
        </Box>
      ) : null}
      {!skeleton && data.length > 0 ? (
        <Box
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-responsive-table-mobile-status
          sx={{ position: "absolute", width: 1, height: 1, p: 0, m: -1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
        >
          {nextPageStatus}
        </Box>
      ) : null}
    </Box>
  );
}

function MobileResponsiveTableSkeleton({
  cardCount,
  hasEndAdornment,
  hasHelper,
  visible,
}: {
  cardCount: number;
  hasEndAdornment: boolean;
  hasHelper: boolean;
  visible: boolean;
}) {
  return (
    <Card
      aria-hidden="true"
      sx={{ overflow: "clip", flexShrink: 0, borderRadius: 0, visibility: visible ? "visible" : "hidden" }}
    >
      {Array.from({ length: cardCount }).map((_, cardIndex) => (
        <Box key={`mobile-skeleton-${cardIndex}`} data-responsive-table-mobile-skeleton-row>
          <Accordion square disableGutters elevation={0} expanded={false} sx={getMobileAccordionSx(cardIndex)}>
            <AccordionSummary
              tabIndex={-1}
              expandIcon={<VireoSkeleton variant="circular" width={24} height={24} />}
              sx={MOBILE_SUMMARY_SX}
            >
              <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <VireoSkeleton variant="rounded" height={22} width={`${42 + ((cardIndex * 13) % 24)}%`} />
              </Box>
              {hasEndAdornment || hasHelper ? (
                <Stack spacing={0.25} sx={{ flexShrink: 0, alignItems: "flex-end", textAlign: "right" }}>
                  {hasEndAdornment ? <VireoSkeleton height={18} width={72} /> : null}
                  {hasHelper ? <VireoSkeleton height={14} width={48} /> : null}
                </Stack>
              ) : null}
            </AccordionSummary>
          </Accordion>
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
          borderTop: 1,
          borderColor: "divider",
          "& > :is(.MuiBox-root, .MuiStack-root)": {
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(0, 1fr)",
            width: "100%",
            gap: 0.5,
          },
          "& > :is(.MuiBox-root, .MuiStack-root) > *": { display: "flex", minWidth: 0 },
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
