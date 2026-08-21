import { VireoPageLayoutProvider } from "@/capabilities/page-layout/providers/VireoPageLayoutProvider/VireoPageLayoutProvider";
import { createVireoPageLayout } from "@/capabilities/page-layout/utils/pageLayout.utils";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoPageBody } from "./VireoPageBody";
import { vireoPageBodyClasses } from "./VireoPageBody.classes";
describe("VireoPageBody", () => {
  it("renders content and an optional semantic drawer", () => {
    render(
      <VireoPageLayoutProvider value={createVireoPageLayout("compact")}>
        <VireoPageBody drawer="Inspector">Content</VireoPageBody>
      </VireoPageLayoutProvider>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Inspector").closest("aside")).toHaveClass(vireoPageBodyClasses.drawer);
  });
  it("forwards the root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<VireoPageBody ref={ref}>Content</VireoPageBody>);
    expect(ref.current).toHaveClass(vireoPageBodyClasses.root);
  });
});
