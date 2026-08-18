import { Box, Stack, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { VireoIconContainer } from "./VireoIconContainer";
import { VIREO_ICON_CONTAINER_NAME } from "./VireoIconContainer.identity";
import { type VireoIconContainerProps } from "./VireoIconContainer.types";

const PREVIEW_SCALE = 4;
const TARGET_VIEW_BOX_SIZE = 24;
const TARGET_PREVIEW_SIZE = TARGET_VIEW_BOX_SIZE * PREVIEW_SCALE;

const clockGeometry = (
  <>
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 4V8L11 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

const largeSquareGeometry = (
  <>
    <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M16 8V16L22 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
  </>
);

const wideSourceGeometry = (
  <>
    <rect x="2" y="2" width="28" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8H24M20 4L24 8L20 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

const tallSourceGeometry = (
  <>
    <rect x="2" y="2" width="12" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8V24M4 20L8 24L12 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

const CustomRoot = React.forwardRef<SVGGElement, React.SVGProps<SVGGElement>>(function CustomRoot(props, ref) {
  return <g {...props} ref={ref} data-custom-root="true" />;
});

type IconPreviewProps = {
  title: string;
  description: string;
  children: React.ReactNode;
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
      width={280}
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

function IconPreview({ title, description, children }: IconPreviewProps) {
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

function IconComparison(props: VireoIconContainerProps) {
  const { children, viewBoxHeight, viewBoxWidth } = props;
  const sourceDimensions = `${viewBoxWidth}×${viewBoxHeight}`;

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
          <svg
            aria-label={`Original ${sourceDimensions} SVG geometry`}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            width={viewBoxWidth * PREVIEW_SCALE}
            height={viewBoxHeight * PREVIEW_SCALE}
          >
            {children}
          </svg>
        </IconCoordinateGrid>
      </IconPreview>

      <IconPreview
        title="Normalized with VireoIconContainer"
        description={`${sourceDimensions} source geometry proportionally scaled and centered in a 24×24 output canvas.`}
      >
        <IconCoordinateGrid measurement="24×24 (with VireoIconContainer)" measurementColor="success.main">
          <svg
            aria-label={`Normalized ${sourceDimensions} SVG geometry`}
            viewBox="0 0 24 24"
            width={TARGET_PREVIEW_SIZE}
            height={TARGET_PREVIEW_SIZE}
          >
            <VireoIconContainer {...props} />
          </svg>
        </IconCoordinateGrid>
      </IconPreview>
    </Stack>
  );
}

const meta = {
  title: "Components/Data Display/VireoIconContainer",
  component: VireoIconContainer,
  tags: ["autodocs"],
  render: args => <IconComparison {...args} />,
  args: {
    viewBoxWidth: 16,
    viewBoxHeight: 16,
    children: clockGeometry,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Proportionally scales and centers SVG geometry authored for an arbitrary viewBox within Vireo's standard 24×24 icon coordinate system. Use it inside an SVG when reusing paths whose source coordinates are not already 24×24.",
      },
    },
  },
  argTypes: {
    viewBoxWidth: { control: { type: "number", min: 1 } },
    viewBoxHeight: { control: { type: "number", min: 1 } },
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoIconContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargeSquareSource: Story = {
  args: {
    viewBoxWidth: 32,
    viewBoxHeight: 32,
    children: largeSquareGeometry,
  },
};

export const NonSquareSource: Story = {
  args: {
    viewBoxWidth: 32,
    viewBoxHeight: 16,
    children: wideSourceGeometry,
  },
};

export const PortraitSource: Story = {
  args: {
    viewBoxWidth: 16,
    viewBoxHeight: 32,
    children: tallSourceGeometry,
  },
};

export const CustomizedSlots: Story = {
  args: {
    slots: { root: CustomRoot },
    slotProps: {
      root: ownerState => ({
        "data-source-view-box": `${ownerState.viewBoxWidth}x${ownerState.viewBoxHeight}`,
        sx: { color: "primary.main" },
      }),
    },
  },
};

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      [VIREO_ICON_CONTAINER_NAME]: {
        styleOverrides: {
          root: {
            color: "#7c3aed",
          },
        },
      },
    },
  });
}

export const ThemeCustomization: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={createCustomizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
