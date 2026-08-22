import { VireoDndProvider } from "@/integrations/hello-pangea-dnd/providers/VireoDndProvider/VireoDndProvider";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VireoDropZone } from "./VireoDropZone";
import { vireoDropZoneClasses } from "./VireoDropZone.classes";

describe("VireoDropZone", () => {
  it("renders and merges root customization inside the provider", () => {
    render(
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone
          id={{ type: "list", listId: "one" }}
          mode="reorder"
          className="direct"
          slotProps={{ root: { "aria-label": "Tasks", className: "slot" } }}
        >
          Tasks
        </VireoDropZone>
      </VireoDndProvider>,
    );
    expect(screen.getByText("Tasks")).toHaveClass(vireoDropZoneClasses.root, "direct", "slot");
  });

  it("exposes its mode and disabled state", () => {
    render(
      <VireoDndProvider onDragEnd={() => undefined}>
        <VireoDropZone id={{ type: "list", listId: "archive" }} mode="transfer" disabled>
          Archive
        </VireoDropZone>
      </VireoDndProvider>,
    );
    expect(screen.getByText("Archive")).toHaveAttribute("data-drop-mode", "transfer");
    expect(screen.getByText("Archive")).toHaveClass(vireoDropZoneClasses.disabled);
  });
});
