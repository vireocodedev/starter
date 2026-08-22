import { VireoDropZone } from "@/integrations/hello-pangea-dnd/components/layout/VireoDropZone";
import { VireoDndProvider } from "@/integrations/hello-pangea-dnd/providers/VireoDndProvider/VireoDndProvider";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VireoDraggableItem } from "./VireoDraggableItem";
import { vireoDraggableItemClasses } from "./VireoDraggableItem.classes";

describe("VireoDraggableItem", () => {
  it("renders a root drag handle and merges root classes", () => {
    render(
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "list", listId: "one" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "one" }} index={0} className="consumer">
            Task
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>,
    );
    expect(screen.getByText("Task")).toHaveClass(vireoDraggableItemClasses.root, "consumer");
  });

  it("exposes disabled state", () => {
    render(
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "list", listId: "one" }} mode="reorder">
          <VireoDraggableItem id={{ type: "task", taskId: "one" }} index={0} disabled>
            Disabled task
          </VireoDraggableItem>
        </VireoDropZone>
      </VireoDndProvider>,
    );
    expect(screen.getByText("Disabled task")).toHaveClass(vireoDraggableItemClasses.disabled);
  });
});
