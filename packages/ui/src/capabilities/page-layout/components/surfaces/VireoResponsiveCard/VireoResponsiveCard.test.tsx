import { VireoPageLayoutProvider } from "@/capabilities/page-layout/providers/VireoPageLayoutProvider/VireoPageLayoutProvider";
import { createVireoPageLayout } from "@/capabilities/page-layout/utils/pageLayout.utils";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoResponsiveCard } from "./VireoResponsiveCard";
import { vireoResponsiveCardClasses } from "./VireoResponsiveCard.classes";
describe("VireoResponsiveCard", () => {
  it("keeps stable root markup in compact mode", () => {
    render(
      <VireoPageLayoutProvider value={createVireoPageLayout("compact")}>
        <VireoResponsiveCard>Content</VireoResponsiveCard>
      </VireoPageLayoutProvider>,
    );
    expect(screen.getByText("Content")).toHaveClass(vireoResponsiveCardClasses.root);
    expect(screen.getByText("Content")).toHaveAttribute("data-vireo-page-mode", "compact");
  });
  it("forwards its card ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<VireoResponsiveCard ref={ref}>Content</VireoResponsiveCard>);
    expect(ref.current).toHaveClass(vireoResponsiveCardClasses.root);
  });
});
