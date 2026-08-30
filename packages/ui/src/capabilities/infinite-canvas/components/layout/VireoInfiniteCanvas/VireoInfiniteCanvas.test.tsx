import { useVireoInfiniteCanvas } from "@/capabilities/infinite-canvas/hooks/useVireoInfiniteCanvas/useVireoInfiniteCanvas";
import { Button } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoInfiniteCanvas } from "./VireoInfiniteCanvas";
import { vireoInfiniteCanvasClasses } from "./VireoInfiniteCanvas.classes";
function Controls() {
  const { isFullscreen, isFullscreenSupported, pan, resetTransform, scale, setTransform } = useVireoInfiniteCanvas();
  return (
    <>
      <span>Scale {scale}</span>
      <span>Pan {pan.x}</span>
      <span>{isFullscreen ? "Fullscreen" : "Embedded"}</span>
      <span>{isFullscreenSupported ? "Fullscreen supported" : "Fullscreen unsupported"}</span>
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
    expect(screen.getByText("Embedded")).toBeInTheDocument();
    expect(screen.getByText("Fullscreen unsupported")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Scale 1")).toBeInTheDocument();
  });
  it("forwards its root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<VireoInfiniteCanvas ref={ref} />);
    expect(ref.current).toHaveClass(vireoInfiniteCanvasClasses.root);
  });

  it("preserves ordinary wheel and touch scrolling by default", () => {
    render(
      <VireoInfiniteCanvas aria-label="Workflow canvas">
        <Controls />
      </VireoInfiniteCanvas>,
    );

    const canvas = screen.getByLabelText("Workflow canvas");
    const wheelEvent = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -100 });
    canvas.dispatchEvent(wheelEvent);

    expect(wheelEvent.defaultPrevented).toBe(false);
    expect(screen.getByText("Scale 1")).toBeInTheDocument();
    expect(canvas).toHaveStyle({ touchAction: "auto" });

    fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: "touch" });
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 10, pointerId: 1, pointerType: "touch" });
    expect(screen.getByText("Pan 0")).toBeInTheDocument();
  });

  it("captures wheel and touch gestures only when explicitly enabled", () => {
    render(
      <VireoInfiniteCanvas aria-label="Workflow canvas" wheelZoomEnabled touchPanEnabled>
        <Controls />
      </VireoInfiniteCanvas>,
    );

    const canvas = screen.getByLabelText("Workflow canvas");
    const wheelWasNotCancelled = fireEvent.wheel(canvas, { deltaY: -100, clientX: 0, clientY: 0 });

    expect(wheelWasNotCancelled).toBe(false);
    expect(screen.getByText("Scale 1.1")).toBeInTheDocument();
    expect(canvas).toHaveStyle({ touchAction: "none" });

    fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: "touch" });
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 10, pointerId: 1, pointerType: "touch" });
    expect(screen.getByText("Pan 20")).toBeInTheDocument();
  });
});
