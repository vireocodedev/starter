import { VireoInfiniteCanvas } from "@/capabilities/infinite-canvas/components/layout/VireoInfiniteCanvas/VireoInfiniteCanvas";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VireoInfiniteCanvasBody } from "./VireoInfiniteCanvasBody";
import { vireoInfiniteCanvasBodyClasses } from "./VireoInfiniteCanvasBody.classes";
describe("VireoInfiniteCanvasBody", () => {
  it("applies the shared world transform", () => {
    render(
      <VireoInfiniteCanvas aria-label="Workflow canvas" defaultTransform={{ scale: 2, pan: { x: 10, y: 20 } }}>
        <VireoInfiniteCanvasBody>World</VireoInfiniteCanvasBody>
      </VireoInfiniteCanvas>,
    );
    expect(screen.getByText("World")).toHaveClass(vireoInfiniteCanvasBodyClasses.root);
    expect(screen.getByText("World")).toHaveStyle({ transform: "translate(10px, 20px) scale(2)" });
  });
});
