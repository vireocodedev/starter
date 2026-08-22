import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoInfiniteCanvasOverlay } from "./VireoInfiniteCanvasOverlay";
import { vireoInfiniteCanvasOverlayClasses } from "./VireoInfiniteCanvasOverlay.classes";
describe("VireoInfiniteCanvasOverlay", () => {
  it("renders fixed interactive content and forwards its root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoInfiniteCanvasOverlay ref={ref} position="bottom-right">
        Tools
      </VireoInfiniteCanvasOverlay>,
    );
    expect(ref.current).toHaveClass(vireoInfiniteCanvasOverlayClasses.root);
    expect(screen.getByText("Tools")).toHaveClass(vireoInfiniteCanvasOverlayClasses.content);
  });
});
