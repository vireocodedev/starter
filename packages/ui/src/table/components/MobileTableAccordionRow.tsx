import { MobileTableViewport } from "@/table/components/MobileTableViewport";
import { type ActionsColumnAlign, type RgoServerTableColumn } from "@/table/types";
import { isNearScrollEnd, MOBILE_TABLE_LOAD_MORE_THRESHOLD_PX } from "@/table/utils/mobileInfiniteScroll.utils";
import { ACTIONS_COLUMN_JUSTIFY_CONTENT, getColumnId, renderBody, renderHeader } from "@/table/utils/mobileTable.utils";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import React from "react";

export function MobileTableRows<TElement>({
  actionColumn,
  actionsColumnAlign,
  data,
  defaultExpanded,
  detailColumns,
  expandedByKey,
  handleExpandedChange,
  hasNextPage = false,
  isFetchingNextPage = false,
  keyMapper,
  onLoadNextPage,
  setAccordionRef,
  titleColumn,
  titleEndAdornmentFn,
}: {
  actionColumn: RgoServerTableColumn<TElement> | undefined;
  actionsColumnAlign: ActionsColumnAlign;
  data: TElement[];
  defaultExpanded: boolean;
  detailColumns: RgoServerTableColumn<TElement>[];
  expandedByKey: Record<string, boolean>;
  handleExpandedChange: (key: string, expanded: boolean) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  keyMapper: (element: TElement) => React.Key;
  onLoadNextPage?: () => void;
  setAccordionRef: (key: string, element: HTMLDivElement | null) => void;
  titleColumn: RgoServerTableColumn<TElement> | undefined;
  titleEndAdornmentFn?: (element: TElement) => React.ReactNode;
}) {
  const { t } = usePlatformTranslation();
  const mobileTableViewportRef = React.useRef<HTMLDivElement | null>(null);
  const loadMoreSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const loadRequestPendingRef = React.useRef(false);
  const previousDataLengthRef = React.useRef(data.length);
  const wasFetchingNextPageRef = React.useRef(isFetchingNextPage);

  React.useEffect(() => {
    const dataChanged = previousDataLengthRef.current !== data.length;
    const fetchCompleted = wasFetchingNextPageRef.current && !isFetchingNextPage;

    if (dataChanged || fetchCompleted || !hasNextPage) {
      loadRequestPendingRef.current = false;
    }

    previousDataLengthRef.current = data.length;
    wasFetchingNextPageRef.current = isFetchingNextPage;
  }, [data.length, hasNextPage, isFetchingNextPage]);

  const requestNextPage = React.useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || !onLoadNextPage || loadRequestPendingRef.current) {
      return;
    }

    loadRequestPendingRef.current = true;
    onLoadNextPage();
  }, [hasNextPage, isFetchingNextPage, onLoadNextPage]);

  const checkScrollPosition = React.useCallback(() => {
    const viewport = mobileTableViewportRef.current;

    if (viewport && isNearScrollEnd(viewport)) {
      requestNextPage();
    }
  }, [requestNextPage]);

  React.useEffect(() => {
    const viewport = mobileTableViewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.addEventListener("scroll", checkScrollPosition, { passive: true });
    return () => viewport.removeEventListener("scroll", checkScrollPosition);
  }, [checkScrollPosition]);

  React.useEffect(() => {
    const animationFrame = window.requestAnimationFrame(checkScrollPosition);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [checkScrollPosition, data.length]);

  React.useEffect(() => {
    const root = mobileTableViewportRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (
      !root ||
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      !onLoadNextPage ||
      !globalThis.IntersectionObserver
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          requestNextPage();
        }
      },
      {
        root,
        rootMargin: `0px 0px ${MOBILE_TABLE_LOAD_MORE_THRESHOLD_PX}px 0px`,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadNextPage, requestNextPage]);

  return (
    <MobileTableViewport
      viewportRef={mobileTableViewportRef}
      sx={{
        marginTop: "0 !important",
        marginBottom: "0 !important",
        marginLeft: "0 !important",
        marginRight: "0 !important",
      }}
    >
      <Stack
        sx={{
          "& > .MuiPaper-root": {
            borderBottom: "1px solid var(--mui-palette-grey-300)",
          },
        }}
      >
        {data.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography color="text.secondary">{t("common.noRecordsFound")}</Typography>
          </Box>
        ) : (
          data.map((element, index) => {
            const key = String(keyMapper(element));
            const expanded = expandedByKey[key] ?? defaultExpanded;
            const titleEndAdornment = titleEndAdornmentFn?.(element);

            return (
              <Accordion
                square
                key={key}
                ref={node => setAccordionRef(key, node)}
                disableGutters
                expanded={expanded}
                onChange={(_event, nextExpanded) => handleExpandedChange(key, nextExpanded)}
                slots={{ heading: "div" }}
                sx={{
                  boxShadow: "none",
                  "&::before": {
                    display: "none",
                  },
                }}
                slotProps={{
                  transition: {
                    unmountOnExit: true,
                  },
                }}
              >
                <AccordionSummary
                  sx={{
                    minHeight: 64,
                    px: 1.5,
                    "& .MuiAccordionSummary-content": {
                      my: 1,
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                    },
                  }}
                >
                  <Box
                    width={28}
                    display="flex"
                    flexShrink={0}
                    alignItems="center"
                    justifyContent="center"
                    color="text.secondary"
                  >
                    {expanded ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowUpRoundedIcon />}
                  </Box>

                  <Box
                    minWidth={0}
                    flex={1}
                    sx={{
                      "&&": {
                        fontWeight: 500,
                        lineHeight: 1.3,
                        fontSize: "1.125rem",
                      },
                      "&& *": {
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        lineHeight: "inherit",
                      },
                    }}
                  >
                    {titleColumn ? renderBody(titleColumn, element, index) : key}
                  </Box>

                  {titleEndAdornment != null ? (
                    <Box display="flex" alignItems="center" flexShrink={0} ml={1}>
                      {titleEndAdornment}
                    </Box>
                  ) : null}
                </AccordionSummary>

                <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.25 }}>
                  <Stack spacing={0}>
                    {detailColumns.map(column => {
                      const isActionColumn = actionColumn && getColumnId(column) === getColumnId(actionColumn);

                      if (isActionColumn) {
                        return (
                          <Box
                            key={getColumnId(column)}
                            display="flex"
                            justifyContent={ACTIONS_COLUMN_JUSTIFY_CONTENT[actionsColumnAlign]}
                            py={1}
                          >
                            {renderBody(column, element, index)}
                          </Box>
                        );
                      }

                      return (
                        <Box
                          key={getColumnId(column)}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          gap={2}
                          py={0.25}
                        >
                          <Typography variant="body2" color="text.secondary" flexShrink={0}>
                            {renderHeader(column)}
                          </Typography>
                          <Box minWidth={0} textAlign="right">
                            {renderBody(column, element, index)}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}

        <Box
          ref={loadMoreSentinelRef}
          minHeight={isFetchingNextPage ? 56 : 1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-live="polite"
        >
          {isFetchingNextPage ? <CircularProgress size={24} /> : null}
        </Box>
      </Stack>
    </MobileTableViewport>
  );
}
