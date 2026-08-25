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
  it("applies regular theme spacing on every side while owning the container gutters", () => {
    render(
      <VireoPageLayoutProvider value={createVireoPageLayout("regular")}>
        <VireoPageBody>Content</VireoPageBody>
      </VireoPageLayoutProvider>,
    );
    const container = screen.getByText("Content").closest(`.${vireoPageBodyClasses.container}`);
    expect(container).toHaveClass("MuiContainer-disableGutters");
    expect(container).toHaveStyle({ padding: "24px" });
  });
  it("keeps compact pages edge-to-edge unless compact padding is enabled", () => {
    const { rerender } = render(
      <VireoPageLayoutProvider value={createVireoPageLayout("compact")}>
        <VireoPageBody>Content</VireoPageBody>
      </VireoPageLayoutProvider>,
    );
    expect(screen.getByText("Content").closest(`.${vireoPageBodyClasses.container}`)).toHaveStyle({ padding: "0px" });
    rerender(
      <VireoPageLayoutProvider value={createVireoPageLayout("compact")}>
        <VireoPageBody paddingOnCompact>Content</VireoPageBody>
      </VireoPageLayoutProvider>,
    );
    expect(screen.getByText("Content").closest(`.${vireoPageBodyClasses.container}`)).toHaveStyle({ padding: "16px" });
  });
  it("lets the container slot override the default padding", () => {
    render(
      <VireoPageLayoutProvider value={createVireoPageLayout("regular")}>
        <VireoPageBody slotProps={{ container: { sx: { p: 1 } } }}>Content</VireoPageBody>
      </VireoPageLayoutProvider>,
    );
    expect(screen.getByText("Content").closest(`.${vireoPageBodyClasses.container}`)).toHaveStyle({ padding: "8px" });
  });
  it("forwards the root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<VireoPageBody ref={ref}>Content</VireoPageBody>);
    expect(ref.current).toHaveClass(vireoPageBodyClasses.root);
  });
});
