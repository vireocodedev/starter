import { Stack, Typography } from "@mui/material";
import { VireoIconContainer } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoIconContainerComparisonFrame } from "@vireocodedev/starter-ui/storybook/VireoIconContainer";

const landscapeGeometry = (
  <>
    <rect x="2" y="2" width="28" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8H24M20 4L24 8L20 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

const portraitGeometry = (
  <>
    <rect x="2" y="2" width="12" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8V24M4 20L8 24L12 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

export default function AspectRatioPreservationExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h6">Landscape source</Typography>
          <VireoIconContainerComparisonFrame
            sourceDimensions="32×16"
            original={
              <svg aria-label="Original 32×16 landscape SVG geometry" viewBox="0 0 32 16" width={128} height={64}>
                {landscapeGeometry}
              </svg>
            }
            normalized={
              <svg aria-label="Normalized 32×16 landscape SVG geometry" viewBox="0 0 24 24" width={96} height={96}>
                <VireoIconContainer viewBoxWidth={32} viewBoxHeight={16}>
                  {landscapeGeometry}
                </VireoIconContainer>
              </svg>
            }
          />
        </Stack>

        <Stack spacing={2}>
          <Typography variant="h6">Portrait source</Typography>
          <VireoIconContainerComparisonFrame
            sourceDimensions="16×32"
            original={
              <svg aria-label="Original 16×32 portrait SVG geometry" viewBox="0 0 16 32" width={64} height={128}>
                {portraitGeometry}
              </svg>
            }
            normalized={
              <svg aria-label="Normalized 16×32 portrait SVG geometry" viewBox="0 0 24 24" width={96} height={96}>
                <VireoIconContainer viewBoxWidth={16} viewBoxHeight={32}>
                  {portraitGeometry}
                </VireoIconContainer>
              </svg>
            }
          />
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
