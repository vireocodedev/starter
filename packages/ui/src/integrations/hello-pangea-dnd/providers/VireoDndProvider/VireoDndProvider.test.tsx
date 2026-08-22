import { VireoDraggableItem } from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem";
import { VireoDropZone } from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useVireoDndState } from "@/integrations/hello-pangea-dnd/hooks/useVireoDndState/useVireoDndState";
import { VireoDndProvider } from "./VireoDndProvider";

function StateProbe() {
  const state = useVireoDndState();
  return <output>{state.isDragging ? "dragging" : "idle"}</output>;
}

describe("VireoDndProvider", () => {
  it("provides an idle readonly lifecycle state", () => {
    render(
      <VireoDndProvider onDragEnd={() => undefined}>
        <StateProbe />
      </VireoDndProvider>,
    );
    expect(screen.getByText("idle")).toBeVisible();
  });

  it("rejects nested drag domains", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(
        <VireoDndProvider onDragEnd={() => undefined}>
          <VireoDndProvider onDragEnd={() => undefined} />
        </VireoDndProvider>,
      ),
    ).toThrow(/cannot be nested/);
    vi.restoreAllMocks();
  });

  it("reports one typed cancellation for a keyboard drag", async () => {
    const onDragEnd = vi.fn();
    render(
      <VireoDndProvider onDragEnd={onDragEnd}>
        <VireoDropZone id={{ type: "list", listId: "tasks" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "first" }} index={0}>
            First
          </VireoDraggableItem>
          <VireoDraggableItem id={{ type: "task", taskId: "second" }} index={1}>
            Second
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>,
    );

    const first = screen.getByText("First");
    first.focus();
    fireEvent.keyDown(first, { key: " ", code: "Space", keyCode: 32, which: 32 });
    await waitFor(() => expect(first).toHaveAttribute("data-dragging", "true"));
    fireEvent.keyDown(first, { key: "Escape", code: "Escape", keyCode: 27, which: 27 });

    await waitFor(() => expect(onDragEnd).toHaveBeenCalledTimes(1));
    expect(onDragEnd.mock.calls[0][0]).toMatchObject({
      draggable: { type: "task", taskId: "first" },
      source: { id: { type: "list", listId: "tasks" }, index: 0 },
      destination: null,
      reason: "cancel",
    });
  });
});
