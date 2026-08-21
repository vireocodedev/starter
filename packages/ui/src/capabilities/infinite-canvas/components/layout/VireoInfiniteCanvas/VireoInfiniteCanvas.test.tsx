import { useVireoInfiniteCanvas } from "@/capabilities/infinite-canvas/hooks/useVireoInfiniteCanvas/useVireoInfiniteCanvas";
import { Button } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoInfiniteCanvas } from "./VireoInfiniteCanvas";
import { vireoInfiniteCanvasClasses } from "./VireoInfiniteCanvas.classes";
function Controls() {
  const { resetTransform, scale, setTransform } = useVireoInfiniteCanvas();
  return (
    <>
      <span>Scale {scale}</span>
      <Button onClick={() => setTransform({ scale: 99, pan: { x: 4, y: 5 } })}>Set</Button>
      <Button onClick={resetTransform}>Reset</Button>
    </>
  );
}
describe("VireoInfiniteCanvas", () => {
  it("provides clamped uncontrolled transform actions", async () => {
    render(
      <VireoInfiniteCanvas maxScale={2} defaultTransform={{ scale: 1, pan: { x: 0, y: 0 } }}>
        <Controls />
      </VireoInfiniteCanvas>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Set" }));
    expect(screen.getByText("Scale 2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Scale 1")).toBeInTheDocument();
  });
  it("forwards its root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<VireoInfiniteCanvas ref={ref} />);
    expect(ref.current).toHaveClass(vireoInfiniteCanvasClasses.root);
  });
});
