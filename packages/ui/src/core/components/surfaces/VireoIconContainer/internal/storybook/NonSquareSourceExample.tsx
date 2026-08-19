import { VireoIconContainer } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoIconContainerComparisonFrame } from "@vireocodedev/starter-ui/storybook/VireoIconContainer";

export type NonSquareSourceExampleProps = {
  viewBoxHeight?: number;
  viewBoxWidth?: number;
};

const arrowGeometry = (
  <>
    <rect x="2" y="2" width="28" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8H24M20 4L24 8L20 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

export default function NonSquareSourceExample({ viewBoxHeight = 16, viewBoxWidth = 32 }: NonSquareSourceExampleProps) {
  const sourceDimensions = `${viewBoxWidth}×${viewBoxHeight}`;

  return (
    <VireoStorybookProvider>
      <VireoIconContainerComparisonFrame
        sourceDimensions={sourceDimensions}
        original={
          <svg
            aria-label={`Original ${sourceDimensions} SVG geometry`}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            width={viewBoxWidth * 4}
            height={viewBoxHeight * 4}
          >
            {arrowGeometry}
          </svg>
        }
        normalized={
          <svg aria-label={`Normalized ${sourceDimensions} SVG geometry`} viewBox="0 0 24 24" width={96} height={96}>
            <VireoIconContainer viewBoxWidth={viewBoxWidth} viewBoxHeight={viewBoxHeight}>
              {arrowGeometry}
            </VireoIconContainer>
          </svg>
        }
      />
    </VireoStorybookProvider>
  );
}
