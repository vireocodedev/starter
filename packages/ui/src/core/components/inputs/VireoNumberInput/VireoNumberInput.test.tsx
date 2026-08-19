import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoNumberInput } from "./VireoNumberInput";
import { VIREO_NUMBER_INPUT_NAME } from "./VireoNumberInput.identity";
describe(VIREO_NUMBER_INPUT_NAME, () => {
  it("normalizes decimal commas and emits complete values", () => {
    const onChange = vi.fn();
    render(<VireoNumberInput label="Rate" value={null} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "12,5" } });
    expect(onChange).toHaveBeenCalledWith(12.5);
  });
  it("preserves intermediate numeric text without emitting", () => {
    const onChange = vi.fn();
    render(<VireoNumberInput label="Rate" value={null} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "-" } });
    expect(screen.getByRole("textbox")).toHaveValue("-");
    expect(onChange).not.toHaveBeenCalled();
  });
  it("clamps input and forwards its native ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<VireoNumberInput ref={ref} label="Rate" value={2} min={1} max={5} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "8" } });
    expect(ref.current).toBe(screen.getByRole("textbox"));
    expect(onChange).toHaveBeenLastCalledWith(5);
  });
});
