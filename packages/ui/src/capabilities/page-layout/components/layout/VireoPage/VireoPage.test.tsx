import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoPage } from "./VireoPage";
import { vireoPageClasses } from "./VireoPage.classes";
describe("VireoPage", () => {
  it("provides a controlled container mode and forwards its root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoPage ref={ref} mode="wide">
        Content
      </VireoPage>,
    );
    expect(screen.getByText("Content")).toHaveAttribute("data-vireo-page-mode", "wide");
    expect(ref.current).toHaveClass(vireoPageClasses.root);
  });
  it("supports root slot customization", () => {
    render(
      <VireoPage mode="regular" slots={{ root: "section" }} slotProps={{ root: { "aria-label": "Workspace" } }}>
        Content
      </VireoPage>,
    );
    expect(screen.getByRole("region", { name: "Workspace" })).toHaveClass(vireoPageClasses.root);
  });
});
