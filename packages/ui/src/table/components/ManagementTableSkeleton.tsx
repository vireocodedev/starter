import { DelayedRender } from "@/components/DelayedRender";
import { useAppPageContentLayout } from "@/hooks/useAppPageContentLayout";
import { Box, Card, CardHeader, Skeleton, Stack } from "@mui/material";

const DESKTOP_ROWS = 16;
const DESKTOP_COLUMNS = 5;
const MOBILE_ROWS = 12;

const DESKTOP_ACTIONS_HEADER_HEIGHT = 48;
const DESKTOP_TABLE_HEADER_CELL_HEIGHT = 24;
const DESKTOP_TABLE_BODY_CELL_HEIGHT = 40;

function DesktopManagementTableSkeleton() {
  return (
    <DelayedRender>
      <Card sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <CardHeader
          sx={{ p: 2, flexShrink: 0 }}
          title={
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* noop */}
              <Box flex={1} />
              <Skeleton
                variant="rounded"
                sx={{ maxWidth: "608px" }}
                width="100%"
                height={DESKTOP_ACTIONS_HEADER_HEIGHT}
              />
              <Skeleton variant="rounded" width={112} height={DESKTOP_ACTIONS_HEADER_HEIGHT} />
            </Stack>
          }
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            borderTop: "1px solid var(--mui-palette-grey-300)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${DESKTOP_COLUMNS}, minmax(0, 1fr))`,
              gap: 2,
              p: 2,
              borderBottom: "1px solid var(--mui-palette-grey-300)",
            }}
          >
            {Array.from({ length: DESKTOP_COLUMNS }).map((_, index) => (
              <Skeleton
                key={index}
                height={DESKTOP_TABLE_HEADER_CELL_HEIGHT}
                variant="rounded"
                width={index === DESKTOP_COLUMNS - 1 ? "45%" : "70%"}
              />
            ))}
          </Box>

          {Array.from({ length: DESKTOP_ROWS }).map((_, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${DESKTOP_COLUMNS}, minmax(0, 1fr))`,
                gap: 2,
                p: 2,
                borderBottom: rowIndex === DESKTOP_ROWS - 1 ? 0 : "1px solid var(--mui-palette-grey-200)",
              }}
            >
              {Array.from({ length: DESKTOP_COLUMNS }).map((__, columnIndex) => (
                <Skeleton
                  key={columnIndex}
                  variant="rounded"
                  height={DESKTOP_TABLE_BODY_CELL_HEIGHT}
                  width={columnIndex === DESKTOP_COLUMNS - 1 ? "50%" : columnIndex % 2 === 0 ? "85%" : "65%"}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Card>
    </DelayedRender>
  );
}

function MobileManagementTableSkeleton() {
  return (
    <DelayedRender>
      <Stack
        width="100%"
        height="100%"
        minHeight={0}
        sx={{
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            borderBottom: "1px solid var(--mui-palette-grey-300)",
            flexShrink: 0,
          }}
        >
          <Box flex={1} minWidth={0}>
            <Skeleton variant="rounded" width="100%" height={40} />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 40,
              p: 1,
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                width: "24px",
                height: "24px",
                // Exact vector path for the rounded filter lines
                clipPath: `path('M11 18h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1m4 6h10c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1')`,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <Stack
            sx={{
              "& > *": {
                borderBottom: "1px solid var(--mui-palette-grey-300)",
              },
            }}
          >
            {Array.from({ length: MOBILE_ROWS }).map((_, index) => (
              <Box key={index} sx={{ p: "14px !important" }}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Skeleton
                    variant="rectangular"
                    animation="pulse"
                    sx={{
                      width: "24px",
                      height: "24px",
                      clipPath: `path('M8.12 14.71 12 10.83l3.88 3.88c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L12.7 8.71a.996.996 0 0 0-1.41 0L6.7 13.3c-.39.39-.39 1.02 0 1.41.39.38 1.03.39 1.42 0')`,
                    }}
                  />

                  <Box flex={1}>
                    <Skeleton variant="text" width="94%" height={36} />
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </DelayedRender>
  );
}

export function ManagementTableSkeleton() {
  const { isCompact } = useAppPageContentLayout();

  if (isCompact) {
    return <MobileManagementTableSkeleton />;
  }

  return <DesktopManagementTableSkeleton />;
}
