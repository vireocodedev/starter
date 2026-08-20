import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { Button, ThemeProvider, createTheme, type ButtonProps } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { vireoFormResetButtonClasses } from "./VireoFormResetButton.classes";
import { VIREO_FORM_RESET_BUTTON_NAME } from "./VireoFormResetButton.identity";
import type { VireoFormResetButtonProps } from "./VireoFormResetButton.types";

function Harness({ buttonProps }: { buttonProps?: VireoFormResetButtonProps }) {
  const form = useVireoForm({ defaultValues: { name: "Northstar" } });
  return (
    <form.Form>
      <form.Field name="name">
        {field => (
          <input
            aria-label="Name"
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value)}
          />
        )}
      </form.Field>
      <form.ResetButton {...buttonProps}>Reset</form.ResetButton>
    </form.Form>
  );
}

describe(VIREO_FORM_RESET_BUTTON_NAME, () => {
  it("renders a disabled native reset button while the form is pristine", () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "Reset" });
    expect(button).toHaveAttribute("type", "reset");
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      vireoFormResetButtonClasses.root,
      vireoFormResetButtonClasses.disabled,
      vireoFormResetButtonClasses.pristine,
    );
  });

  it("enables for dirty values and resets the form to pristine defaults", () => {
    render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Name" });
    const button = screen.getByRole("button", { name: "Reset" });

    fireEvent.change(input, { target: { value: "Atlas" } });
    expect(button).toBeEnabled();
    expect(button).toHaveClass(vireoFormResetButtonClasses.dirty);
    expect(button).not.toHaveClass(vireoFormResetButtonClasses.pristine);

    fireEvent.click(button);
    expect(input).toHaveValue("Northstar");
    expect(button).toBeDisabled();
  });

  it("preserves a consumer-disabled condition after the form becomes dirty", () => {
    render(<Harness buttonProps={{ disabled: true }} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Atlas" } });
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("forwards refs, merges slots, and preserves component-owned reset semantics", () => {
    const forwardedRef = React.createRef<HTMLButtonElement>();
    const rootSlotRef = React.createRef<HTMLButtonElement>();
    render(
      <Harness
        buttonProps={{
          ref: forwardedRef,
          className: "direct-class",
          slotProps: {
            root: {
              ref: rootSlotRef,
              className: "slot-class",
              "data-origin": "slot",
              style: { paddingRight: 12 },
              type: "button",
            },
          },
          style: { paddingLeft: 10 },
        }}
      />,
    );
    const root = screen.getByRole("button", { name: "Reset" });
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveAttribute("type", "reset");
    expect(root).toHaveClass("direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports a replacement root and owner-state slot props", () => {
    const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function CustomButton(props, ref) {
      return <Button {...props} ref={ref} data-custom-root="true" />;
    });
    render(
      <Harness
        buttonProps={{
          slots: { root: CustomButton },
          slotProps: { root: ownerState => ({ "data-pristine-state": ownerState.pristine }) },
        }}
      />,
    );
    const root = screen.getByRole("button", { name: "Reset" });
    expect(root).toHaveAttribute("data-custom-root", "true");
    expect(root).toHaveAttribute("data-pristine-state", "true");
  });

  it("uses theme default props and state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_RESET_BUTTON_NAME]: {
          defaultProps: { variant: "outlined" },
          styleOverrides: { pristine: { letterSpacing: "3px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <Harness />
      </ThemeProvider>,
    );
    const root = screen.getByRole("button", { name: "Reset" });
    expect(root).toHaveClass("MuiButton-outlined", vireoFormResetButtonClasses.pristine);
    expect(root).toHaveStyle({ letterSpacing: "3px" });
  });
});
