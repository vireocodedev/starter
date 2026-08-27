import { VireoIconContainer } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { VireoIconContainerComparisonFrame } from "@vireocodedev/ui/storybook/VireoIconContainer";

const clockGeometry = (
  <>
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 4V8L11 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </>
);

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconContainerComparisonFrame
        sourceDimensions="16×16"
        original={
          <svg aria-label="Original 16×16 SVG geometry" viewBox="0 0 16 16" width={64} height={64}>
            {clockGeometry}
          </svg>
        }
        normalized={
          <svg aria-label="Normalized 16×16 SVG geometry" viewBox="0 0 24 24" width={96} height={96}>
            <VireoIconContainer viewBoxWidth={16} viewBoxHeight={16}>
              {clockGeometry}
            </VireoIconContainer>
          </svg>
        }
      />
    </VireoStorybookProvider>
  );
}
