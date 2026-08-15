import { MobileAccordionEndAdornment, MobileAccordionTitleCell } from "@/index";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("MobileAccordionTitleCell", () => {
  it("renders only the primary line when no secondary is provided", () => {
    render(<MobileAccordionTitleCell primary="18-1-26" />);

    expect(screen.getByText("18-1-26")).toBeInTheDocument();
  });

  it("renders both the primary and secondary line", () => {
    render(<MobileAccordionTitleCell primary="18-1-26" secondary="Acme Ltd." />);

    expect(screen.getByText("18-1-26")).toBeInTheDocument();
    expect(screen.getByText("Acme Ltd.")).toBeInTheDocument();
  });

  it("applies the caption variant to the secondary line", () => {
    render(<MobileAccordionTitleCell primary="18-1-26" secondary="Acme Ltd." />);

    expect(screen.getByText("Acme Ltd.")).toHaveClass("MuiTypography-caption");
  });
});

describe("MobileAccordionEndAdornment", () => {
  it("renders only the primary line when no secondary is provided", () => {
    render(<MobileAccordionEndAdornment primary="17.507 €" />);

    expect(screen.getByText("17.507 €")).toBeInTheDocument();
  });

  it("renders both the primary and secondary line", () => {
    render(<MobileAccordionEndAdornment primary="17.507 €" secondary="01.08.2026" />);

    expect(screen.getByText("17.507 €")).toBeInTheDocument();
    expect(screen.getByText("01.08.2026")).toBeInTheDocument();
  });
});
