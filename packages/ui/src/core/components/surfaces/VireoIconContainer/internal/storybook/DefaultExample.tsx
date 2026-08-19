import { VireoIconContainer } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoIconContainerComparisonFrame } from "@vireocodedev/starter-ui/storybook/VireoIconContainer";

export type DefaultExampleProps = {
  viewBoxHeight?: number;
  viewBoxWidth?: number;
};

const clockGeometry = (
  <>
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 4V8L11 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

export default function DefaultExample({ viewBoxHeight = 16, viewBoxWidth = 16 }: DefaultExampleProps) {
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
            {clockGeometry}
          </svg>
        }
        normalized={
          <svg aria-label={`Normalized ${sourceDimensions} SVG geometry`} viewBox="0 0 24 24" width={96} height={96}>
            <VireoIconContainer viewBoxWidth={viewBoxWidth} viewBoxHeight={viewBoxHeight}>
              {clockGeometry}
            </VireoIconContainer>
          </svg>
        }
      />
    </VireoStorybookProvider>
  );
}
