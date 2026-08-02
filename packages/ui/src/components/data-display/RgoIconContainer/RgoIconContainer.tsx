import { RGO_ICON_SCALE_CONFIG } from "@/utils/iconutils";
import React from "react";
import "./RgoIconContainer.css";

export type RgoIconContainerProps = {
  /** The original width of the SVG's viewBox. */
  viewBoxWidth: number;
  /** The original height of the SVG's viewBox. */
  viewBoxHeight: number;
  /** The SVG elements to be scaled. */
  children: React.ReactNode;
};

/**
 * A React component that scales its child SVG content to fit a standard 24x24 viewBox.
 *
 * @remarks This component calculates a scale transform based on the original SVG's viewBox dimensions
 * and applies it to a \<g\> element wrapping the children. This allows icons with arbitrary viewBox sizes
 * to be rendered at the correct size and aspect ratio within a 24x24 container.
 *
 * @example
 * <svg viewBox="0 0 16 17">
 *   <RgoIconContainer viewBoxWidth={16} viewBoxHeight={17}>
 *     <!-- SVG paths, originally designed for 16x17 viewBox, but scaled to fit 24x24 -->
 *   </RgoIconContainer>
 * </svg>
 *
 * @param viewBoxWidth - The original width of the SVG's viewBox.
 * @param viewBoxHeight - The original height of the SVG's viewBox.
 * @param children - The SVG elements to be scaled.
 */
export function RgoIconContainer({ viewBoxWidth: width, viewBoxHeight: height, children }: RgoIconContainerProps) {
  const transform = React.useMemo(() => {
    const widthScale = RGO_ICON_SCALE_CONFIG.width / width;
    const heightScale = RGO_ICON_SCALE_CONFIG.height / height;
    return `scale(${widthScale} ${heightScale})`;
  }, [width, height]);

  return <g transform={transform}>{children}</g>;
}
