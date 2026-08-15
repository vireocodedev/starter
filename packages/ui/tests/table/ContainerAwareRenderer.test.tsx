import { ContainerAwareRenderer } from "@/index";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("ContainerAwareRenderer", () => {
  it("uses an explicit page layout instead of independently measuring its container", () => {
    const renderMobile = () => <div>Mobile table</div>;
    const renderDesktop = () => <div>Desktop table</div>;
    const { rerender } = render(
      <ContainerAwareRenderer layout="mobile" renderMobile={renderMobile} renderDesktop={renderDesktop} />,
    );

    expect(screen.getByText("Mobile table")).toBeInTheDocument();
    expect(screen.queryByText("Desktop table")).not.toBeInTheDocument();
    expect(screen.getByText("Mobile table").parentElement).toHaveAttribute("data-container-layout", "mobile");

    rerender(<ContainerAwareRenderer layout="desktop" renderMobile={renderMobile} renderDesktop={renderDesktop} />);

    expect(screen.getByText("Desktop table")).toBeInTheDocument();
    expect(screen.queryByText("Mobile table")).not.toBeInTheDocument();
    expect(screen.getByText("Desktop table").parentElement).toHaveAttribute("data-container-layout", "desktop");
  });
});
