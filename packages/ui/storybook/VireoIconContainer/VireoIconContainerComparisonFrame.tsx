import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type React from "react";

const PREVIEW_SCALE = 4;
const TARGET_VIEW_BOX_SIZE = 24;
const TARGET_PREVIEW_SIZE = TARGET_VIEW_BOX_SIZE * PREVIEW_SCALE;

export type VireoIconContainerComparisonFrameProps = {
  normalized: React.ReactNode;
  original: React.ReactNode;
  sourceDimensions: string;
};

type IconPreviewProps = {
  children: React.ReactNode;
  description: string;
  title: string;
};

type IconCoordinateGridProps = {
  children: React.ReactNode;
  measurement: string;
  measurementColor: "error.main" | "success.main";
};

function IconCoordinateGrid({ children, measurement, measurementColor }: IconCoordinateGridProps) {
  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="min(100%, 280px)"
      height={240}
      overflow="visible"
      border="1px solid"
      borderColor="divider"
      borderRadius={2}
      sx={{
        color: "text.primary",
        backgroundColor: "background.default",
        backgroundImage: theme =>
          `linear-gradient(${alpha(theme.palette.divider, 0.45)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.divider, 0.45)} 1px, transparent 1px)`,
        backgroundPosition: "center center",
        backgroundSize: `${PREVIEW_SCALE * 2}px ${PREVIEW_SCALE * 2}px`,
      }}
    >
      <Typography
        position="absolute"
        top={24}
        paddingX={1.25}
        paddingY={0.5}
        color={measurementColor}
        fontWeight={700}
        variant="caption"
        border="1px solid"
        borderColor={measurementColor}
        borderRadius={1}
        sx={theme => ({
          backgroundColor: alpha(
            measurementColor === "error.main" ? theme.palette.error.main : theme.palette.success.main,
            0.12,
          ),
          lineHeight: 1.4,
          whiteSpace: "nowrap",
        })}
      >
        {measurement}
      </Typography>

      <Box
        position="absolute"
        width={TARGET_PREVIEW_SIZE}
        height={TARGET_PREVIEW_SIZE}
        border="1px dashed"
        borderColor="primary.main"
        sx={theme => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          pointerEvents: "none",
        })}
      />

      <Box position="relative" display="flex" alignItems="center" justifyContent="center">
        {children}
      </Box>

      <Typography
        position="absolute"
        bottom={20}
        paddingX={1}
        paddingY={0.25}
        color="text.secondary"
        variant="caption"
        borderRadius={1}
        sx={{ backgroundColor: "background.default", whiteSpace: "nowrap" }}
      >
        24×24 target · {PREVIEW_SCALE}× preview
      </Typography>
    </Box>
  );
}

function IconPreview({ children, description, title }: IconPreviewProps) {
  return (
    <Stack flex="1 1 0" minWidth={0} gap={1.5}>
      <Box>
        <Typography fontWeight={700}>{title}</Typography>
        <Typography color="text.secondary" variant="body2" sx={{ minHeight: { md: "2lh" } }}>
          {description}
        </Typography>
      </Box>

      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={192}
        padding={3}
        border="1px solid"
        borderColor="divider"
        borderRadius={2}
        sx={{ backgroundColor: "background.paper" }}
      >
        {children}
      </Box>
    </Stack>
  );
}

/** Story presentation frame for comparing source SVG geometry with Vireo's normalized output. */
export function VireoIconContainerComparisonFrame({
  normalized,
  original,
  sourceDimensions,
}: VireoIconContainerComparisonFrameProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} width="100%" gap={3}>
      <IconPreview
        title="Original geometry"
        description={`${sourceDimensions} source SVG shown at its native canvas size.`}
      >
        <IconCoordinateGrid
          measurement={`${sourceDimensions} (without VireoIconContainer)`}
          measurementColor="error.main"
        >
          {original}
        </IconCoordinateGrid>
      </IconPreview>

      <IconPreview
        title="Normalized with VireoIconContainer"
        description={`${sourceDimensions} source geometry proportionally scaled and centered in a 24×24 output canvas.`}
      >
        <IconCoordinateGrid measurement="24×24 (with VireoIconContainer)" measurementColor="success.main">
          {normalized}
        </IconCoordinateGrid>
      </IconPreview>
    </Stack>
  );
}
