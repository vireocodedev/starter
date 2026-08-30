import { useVireoInfiniteCanvas } from "@/capabilities/infinite-canvas/hooks/useVireoInfiniteCanvas/useVireoInfiniteCanvas";
import { Button } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
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
      <VireoInfiniteCanvas
        aria-label="Workflow canvas"
        maxScale={2}
        defaultTransform={{ scale: 1, pan: { x: 0, y: 0 } }}
      >
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
    render(<VireoInfiniteCanvas aria-label="Workflow canvas" ref={ref} />);
    expect(ref.current).toHaveClass(vireoInfiniteCanvasClasses.root);
  });

  it("renders a named, focusable region with discoverable keyboard shortcuts", () => {
    render(<VireoInfiniteCanvas aria-label="Workflow canvas" />);

    const canvas = screen.getByRole("region", { name: "Workflow canvas" });
    expect(canvas).toHaveAttribute("tabindex", "0");
    expect(canvas).toHaveAttribute("aria-keyshortcuts", "ArrowUp ArrowDown ArrowLeft ArrowRight + - 0");
  });

  it("accepts visible text as its localized accessible name", () => {
    render(
      <>
        <h2 id="canvas-title">Diagramme de processus</h2>
        <VireoInfiniteCanvas aria-labelledby="canvas-title" />
      </>,
    );

    expect(screen.getByRole("region", { name: "Diagramme de processus" })).toBeInTheDocument();
  });

  it("pans, zooms, and resets from the keyboard without intercepting unrelated keys", () => {
    render(
      <VireoInfiniteCanvas
        aria-label="Workflow canvas"
        defaultTransform={{ scale: 1, pan: { x: 10, y: 20 } }}
        keyboardPanStep={25}
      >
        <Controls />
      </VireoInfiniteCanvas>,
    );

    const canvas = screen.getByRole("region", { name: "Workflow canvas" });
    expect(fireEvent.keyDown(canvas, { key: "ArrowRight" })).toBe(false);
    expect(screen.getByText("Pan -15")).toBeInTheDocument();

    expect(fireEvent.keyDown(canvas, { key: "+" })).toBe(false);
    expect(screen.getByText("Scale 1.1")).toBeInTheDocument();

    expect(fireEvent.keyDown(canvas, { key: "-" })).toBe(false);
    expect(screen.getByText("Scale 1")).toBeInTheDocument();

    expect(fireEvent.keyDown(canvas, { key: "0" })).toBe(false);
    expect(screen.getByText("Pan 10")).toBeInTheDocument();
    expect(fireEvent.keyDown(canvas, { key: "a" })).toBe(true);
    expect(fireEvent.keyDown(canvas, { ctrlKey: true, key: "ArrowRight" })).toBe(true);
    expect(screen.getByText("Pan 10")).toBeInTheDocument();
  });

  it("does not intercept shortcuts originating from interactive canvas children", () => {
    render(
      <VireoInfiniteCanvas aria-label="Workflow canvas">
        <Controls />
      </VireoInfiniteCanvas>,
    );

    const button = screen.getByRole("button", { name: "Set" });
    expect(fireEvent.keyDown(button, { key: "ArrowRight" })).toBe(true);
    expect(screen.getByText("Pan 0")).toBeInTheDocument();
  });

  it("runs root and top-level key handlers first and honors default prevention", () => {
    const order: string[] = [];
    const rootOnKeyDown = vi.fn<React.KeyboardEventHandler<HTMLDivElement>>(() => order.push("slot"));
    const onKeyDown = vi.fn<React.KeyboardEventHandler<HTMLDivElement>>(event => {
      order.push("top-level");
      event.preventDefault();
    });
    render(
      <VireoInfiniteCanvas
        aria-label="Workflow canvas"
        keyboardPanStep={25}
        onKeyDown={onKeyDown}
        slotProps={{ root: { onKeyDown: rootOnKeyDown } }}
      >
        <Controls />
      </VireoInfiniteCanvas>,
    );

    const canvas = screen.getByRole("region", { name: "Workflow canvas" });
    expect(fireEvent.keyDown(canvas, { key: "ArrowRight" })).toBe(false);
    expect(order).toEqual(["slot", "top-level"]);
    expect(screen.getByText("Pan 0")).toBeInTheDocument();
  });

  it("can opt out of the built-in keyboard focus and controls", () => {
    render(
      <VireoInfiniteCanvas aria-label="Static workflow canvas" keyboardControlsEnabled={false}>
        <Controls />
      </VireoInfiniteCanvas>,
    );

    const canvas = screen.getByRole("region", { name: "Static workflow canvas" });
    expect(canvas).not.toHaveAttribute("tabindex");
    expect(canvas).not.toHaveAttribute("aria-keyshortcuts");
    expect(fireEvent.keyDown(canvas, { key: "ArrowRight" })).toBe(true);
    expect(screen.getByText("Pan 0")).toBeInTheDocument();
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

  it("runs root pointer handlers first and honors default prevention", () => {
    const onPointerDown = vi.fn<React.PointerEventHandler<HTMLDivElement>>(event => event.preventDefault());
    const onPointerMove = vi.fn<React.PointerEventHandler<HTMLDivElement>>();
    const onPointerUp = vi.fn<React.PointerEventHandler<HTMLDivElement>>();
    const { rerender } = render(
      <VireoInfiniteCanvas
        aria-label="Workflow canvas"
        slotProps={{ root: { onPointerDown, onPointerMove, onPointerUp } }}
      >
        <Controls />
      </VireoInfiniteCanvas>,
    );

    const canvas = screen.getByLabelText("Workflow canvas");
    fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: "mouse" });
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 10, pointerId: 1, pointerType: "mouse" });
    fireEvent.pointerUp(canvas, { pointerId: 1, pointerType: "mouse" });
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onPointerMove).toHaveBeenCalledOnce();
    expect(onPointerUp).toHaveBeenCalledOnce();
    expect(screen.getByText("Pan 0")).toBeInTheDocument();

    onPointerDown.mockImplementation(() => undefined);
    rerender(
      <VireoInfiniteCanvas
        aria-label="Workflow canvas"
        slotProps={{ root: { onPointerDown, onPointerMove, onPointerUp } }}
      >
        <Controls />
      </VireoInfiniteCanvas>,
    );
    fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10, pointerId: 2, pointerType: "mouse" });
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 10, pointerId: 2, pointerType: "mouse" });
    fireEvent.pointerUp(canvas, { pointerId: 2, pointerType: "mouse" });
    expect(screen.getByText("Pan 20")).toBeInTheDocument();
  });
});
