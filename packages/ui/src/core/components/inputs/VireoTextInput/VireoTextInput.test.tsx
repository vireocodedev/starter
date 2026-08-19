import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoTextInput } from "./VireoTextInput";
import { vireoTextInputClasses } from "./VireoTextInput.classes";
import { VIREO_TEXT_INPUT_NAME } from "./VireoTextInput.identity";

describe(VIREO_TEXT_INPUT_NAME, () => {
  it("normalizes null and reports string values", () => {
    const onChange = vi.fn();
    render(<VireoTextInput label="Name" value={null} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveValue("");
    fireEvent.change(input, { target: { value: "Vireo" } });
    expect(onChange).toHaveBeenCalledWith("Vireo");
  });
  it("forwards the native input ref and composes the root class", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <VireoTextInput
        ref={ref}
        label="Name"
        value="Vireo"
        onChange={() => undefined}
        slotProps={{ root: { className: "custom" } }}
      />,
    );
    expect(ref.current).toBe(screen.getByRole("textbox"));
    expect(ref.current?.closest(`.${vireoTextInputClasses.root}`)).toHaveClass("custom");
  });
  it("supports theme defaults and style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_TEXT_INPUT_NAME]: { defaultProps: { size: "small" }, styleOverrides: { root: { marginTop: "10px" } } },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoTextInput label="Name" value="" onChange={() => undefined} />
      </ThemeProvider>,
    );
    expect(screen.getByRole("textbox").closest(`.${vireoTextInputClasses.root}`)).toHaveStyle({ marginTop: "10px" });
  });
});
