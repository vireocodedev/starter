import { UnsavedChangesContext, type UnsavedChangesContextValue } from "@/capabilities/unsaved-changes/public";
import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { vireoFormClasses } from "./VireoForm.classes";
import { VIREO_FORM_NAME } from "./VireoForm.identity";
import type { VireoFormProps } from "./VireoForm.types";

type HarnessProps = {
  formProps?: VireoFormProps;
  onSubmit?: ReturnType<typeof vi.fn>;
};

function FormHarness({ formProps, onSubmit = vi.fn() }: HarnessProps) {
  const form = useVireoForm({
    defaultValues: { name: "" },
    onSubmit,
  });

  return (
    <form.Form aria-label="Profile form" {...formProps}>
      <form.Field name="name" validators={{ onSubmit: ({ value }) => (value ? undefined : "Name is required") }}>
        {field => (
          <input
            aria-invalid={!field.state.meta.isValid}
            aria-label="Name"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={event => field.handleChange(event.target.value)}
          />
        )}
      </form.Field>
      <button type="submit">Save</button>
      <button type="reset">Reset</button>
    </form.Form>
  );
}

describe(VIREO_FORM_NAME, () => {
  it("renders a native form with Vireo defaults, refs, and merged root customization", () => {
    const forwardedRef = React.createRef<HTMLFormElement>();
    const rootSlotRef = React.createRef<HTMLFormElement>();

    function RefHarness() {
      const form = useVireoForm({ defaultValues: {} });
      return (
        <form.Form
          ref={forwardedRef}
          aria-label="Empty form"
          className="direct-class"
          style={{ paddingLeft: 10 }}
          slotProps={{
            root: {
              ref: rootSlotRef,
              className: "slot-class",
              "data-origin": "slot",
              style: { paddingRight: 12 },
            },
          }}
        />
      );
    }

    render(<RefHarness />);

    const root = screen.getByRole("form", { name: "Empty form" });
    expect(root.tagName).toBe("FORM");
    expect(root).toHaveAttribute("novalidate");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoFormClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("exposes the normalized layout-width preset to root customization", () => {
    function LayoutHarness() {
      const form = useVireoForm({ defaultValues: {} });
      return (
        <form.Form
          aria-label="Wide form"
          layoutWidth="wide"
          slotProps={{ root: ownerState => ({ "data-layout-width": ownerState.layoutWidth }) }}
        />
      );
    }

    render(<LayoutHarness />);

    expect(screen.getByRole("form", { name: "Wide form" })).toHaveAttribute("data-layout-width", "wide");
  });

  it("submits through TanStack Form after the consumer event and respects cancellation", async () => {
    const onSubmit = vi.fn();
    const consumerSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const { rerender } = render(<FormHarness formProps={{ onSubmit: consumerSubmit }} onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByRole("form", { name: "Profile form" }));
    expect(consumerSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(<FormHarness onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Ada" } });
    fireEvent.submit(screen.getByRole("form", { name: "Profile form" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });

  it("uses native reset events to restore the TanStack default values", () => {
    render(<FormHarness />);
    const input = screen.getByRole("textbox", { name: "Name" });

    fireEvent.change(input, { target: { value: "Ada" } });
    expect(input).toHaveValue("Ada");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(input).toHaveValue("");
  });

  it("focuses the first invalid field and exposes form state classes after rejected submit", async () => {
    render(<FormHarness />);
    const root = screen.getByRole("form", { name: "Profile form" });
    const input = screen.getByRole("textbox", { name: "Name" });

    fireEvent.submit(root);

    await waitFor(() => expect(input).toHaveFocus());
    expect(root).toHaveClass(vireoFormClasses.invalid);
  });

  it("registers dirty and busy state only when the unsaved-changes guard is enabled", async () => {
    const upsertRegistration = vi.fn();
    const context: UnsavedChangesContextValue = {
      removeRegistration: vi.fn(),
      requestDiscard: vi.fn(),
      runWithoutNavigationBlock: action => action(),
      upsertRegistration,
    };

    render(
      <UnsavedChangesContext.Provider value={context}>
        <FormHarness formProps={{ unsavedChangesBusy: true, unsavedChangesGuard: true }} />
      </UnsavedChangesContext.Provider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Ada" } });

    await waitFor(() =>
      expect(upsertRegistration).toHaveBeenLastCalledWith(expect.objectContaining({ busy: true, dirty: true })),
    );
  });

  it("uses theme default props and state style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: {
            dirty: { color: "rgb(123, 45, 67)" },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <FormHarness />
      </ThemeProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Ada" } });

    expect(screen.getByRole("form", { name: "Profile form" })).toHaveClass(
      "theme-default-class",
      vireoFormClasses.dirty,
    );
    expect(screen.getByRole("form", { name: "Profile form" })).toHaveStyle({
      color: "rgb(123, 45, 67)",
    });
  });
});
