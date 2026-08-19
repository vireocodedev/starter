import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoPasswordInput } from "./VireoPasswordInput";
import { VIREO_PASSWORD_INPUT_NAME } from "./VireoPasswordInput.identity";
describe(VIREO_PASSWORD_INPUT_NAME, () => {
  it("reports values and forwards the native input ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<VireoPasswordInput ref={ref} label="Password" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
    expect(ref.current).toBe(screen.getByLabelText("Password"));
    expect(onChange).toHaveBeenCalledWith("secret");
  });
  it("toggles visibility with accessible labels", () => {
    render(<VireoPasswordInput label="Password" value="secret" onChange={() => undefined} />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });
});
