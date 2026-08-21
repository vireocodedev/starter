import { Button } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoPageHeader } from "./VireoPageHeader";
import { vireoPageHeaderClasses } from "./VireoPageHeader.classes";
describe("VireoPageHeader", () => {
  it("renders leading, title, and action regions", () => {
    render(<VireoPageHeader leading={<span>Back</span>} title="Customers" actions={<Button>Add</Button>} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toHaveClass(vireoPageHeaderClasses.title);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
  it("forwards the semantic header ref", () => {
    const ref = React.createRef<HTMLElement>();
    render(<VireoPageHeader ref={ref} title="Page" />);
    expect(ref.current?.tagName).toBe("HEADER");
  });
});
