import { VireoIconContainer } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoIconContainerComparisonFrame } from "@vireocodedev/starter-ui/storybook/VireoIconContainer";
import { forwardRef, type SVGProps } from "react";

export type CustomizedSlotsExampleProps = {
  viewBoxHeight?: number;
  viewBoxWidth?: number;
};

const clockGeometry = (
  <>
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 4V8L11 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

const CustomRoot = forwardRef<SVGGElement, SVGProps<SVGGElement>>(function CustomRoot(props, ref) {
  return <g {...props} ref={ref} data-custom-root="true" />;
});

export default function CustomizedSlotsExample({ viewBoxHeight = 16, viewBoxWidth = 16 }: CustomizedSlotsExampleProps) {
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
            <VireoIconContainer
              viewBoxWidth={viewBoxWidth}
              viewBoxHeight={viewBoxHeight}
              slots={{ root: CustomRoot }}
              slotProps={{
                root: ownerState => ({
                  "data-source-view-box": `${ownerState.viewBoxWidth}x${ownerState.viewBoxHeight}`,
                  sx: { color: "primary.main" },
                }),
              }}
            >
              {clockGeometry}
            </VireoIconContainer>
          </svg>
        }
      />
    </VireoStorybookProvider>
  );
}
