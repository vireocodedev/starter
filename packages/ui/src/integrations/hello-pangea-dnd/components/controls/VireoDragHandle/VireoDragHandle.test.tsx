import { VireoDraggableItem } from "@/integrations/hello-pangea-dnd/components/behavior/VireoDraggableItem";
import { VireoDropZone } from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone";
import { VireoDndProvider } from "@/integrations/hello-pangea-dnd/providers/VireoDndProvider/VireoDndProvider";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VireoDragHandle } from "./VireoDragHandle";
import { vireoDragHandleClasses } from "./VireoDragHandle.classes";

describe("VireoDragHandle", () => {
  afterEach(() => vi.restoreAllMocks());
  it("renders an accessible explicit handle", () => {
    render(
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "list", listId: "one" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "one" }} index={0} dragHandle="explicit">
            <VireoDragHandle aria-label="Move task" />
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>,
    );
    expect(screen.getByRole("button", { name: "Move task" })).toHaveClass(vireoDragHandleClasses.root);
  });

  it("rejects use outside an explicit draggable", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<VireoDragHandle aria-label="Move task" />)).toThrow(/dragHandle="explicit"/);
  });
});
