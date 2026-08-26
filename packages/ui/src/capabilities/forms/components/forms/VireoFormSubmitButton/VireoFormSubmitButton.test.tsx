import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { Button, ThemeProvider, createTheme, type ButtonProps } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { vireoFormSubmitButtonClasses } from "./VireoFormSubmitButton.classes";
import { VIREO_FORM_SUBMIT_BUTTON_NAME } from "./VireoFormSubmitButton.identity";
import type { VireoFormSubmitButtonProps } from "./VireoFormSubmitButton.types";

type HarnessProps = { buttonProps?: VireoFormSubmitButtonProps; onSubmit?: () => unknown };

function Harness({ buttonProps, onSubmit = () => undefined }: HarnessProps) {
  const form = useVireoForm({ defaultValues: {}, onSubmit });
  return (
    <form.Form>
      <form.SubmitButton {...buttonProps}>Save</form.SubmitButton>
    </form.Form>
  );
}

describe(VIREO_FORM_SUBMIT_BUTTON_NAME, () => {
  it("renders a native submit button through the bound form API", () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeEnabled();
    expect(button).toHaveClass(vireoFormSubmitButtonClasses.root);
  });

  it("automatically enters loading and submitting states for async submission", async () => {
    let finishSubmission: (() => void) | undefined;
    const onSubmit = vi.fn(() => new Promise<void>(resolve => (finishSubmission = resolve)));
    render(<Harness onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).toBeDisabled());
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass(
      vireoFormSubmitButtonClasses.loading,
      vireoFormSubmitButtonClasses.submitting,
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("aria-busy", "true");

    finishSubmission?.();
    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute("aria-busy");
  });

  it("merges an explicit loading condition without claiming the form is submitting", () => {
    render(<Harness buttonProps={{ loading: true }} />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveClass(vireoFormSubmitButtonClasses.loading);
    expect(button).not.toHaveClass(vireoFormSubmitButtonClasses.submitting);
  });

  it("forwards refs, merges root customization, and preserves component-owned semantics", () => {
    const forwardedRef = React.createRef<HTMLButtonElement>();
    const rootSlotRef = React.createRef<HTMLButtonElement>();
    render(
      <Harness
        buttonProps={{
          ref: forwardedRef,
          className: "direct-class",
          style: { paddingLeft: 10 },
          slotProps: {
            root: {
              ref: rootSlotRef,
              className: "slot-class",
              "data-origin": "slot",
              style: { paddingRight: 12 },
              type: "button",
            },
          },
        }}
      />,
    );
    const root = screen.getByRole("button", { name: "Save" });
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveAttribute("type", "submit");
    expect(root).toHaveClass(vireoFormSubmitButtonClasses.root, "direct-class", "slot-class");
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
          disabled: true,
          slots: { root: CustomButton },
          slotProps: { root: ownerState => ({ "data-disabled-state": ownerState.disabled }) },
        }}
      />,
    );
    const root = screen.getByRole("button", { name: "Save" });
    expect(root).toHaveAttribute("data-custom-root", "true");
    expect(root).toHaveAttribute("data-disabled-state", "true");
    expect(root).toHaveClass(vireoFormSubmitButtonClasses.disabled);
  });

  it("uses theme default props and state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_SUBMIT_BUTTON_NAME]: {
          defaultProps: { loading: true, variant: "contained" },
          styleOverrides: { loading: { letterSpacing: "3px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <Harness />
      </ThemeProvider>,
    );
    const root = screen.getByRole("button", { name: "Save" });
    expect(root).toHaveClass(vireoFormSubmitButtonClasses.loading, "MuiButton-contained");
    expect(root).toHaveStyle({ letterSpacing: "3px" });
  });
});
