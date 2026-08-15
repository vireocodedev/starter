import { GuardedForm } from "@/forms/GuardedForm";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/unsaved-changes/useUnsavedChangesRegistration", () => ({
  useUnsavedChangesRegistration: () => undefined,
}));

type TestForm = {
  buyerId: string;
  items: Array<{ quantity: string }>;
};

function Harness({ buyerInvalid = false }: { buyerInvalid?: boolean }) {
  const form = useForm<TestForm>({
    defaultValues: { buyerId: "selected", items: [{ quantity: "" }] },
    shouldFocusError: false,
    resolver: async () => ({
      values: {},
      errors: {
        ...(buyerInvalid ? { buyerId: { type: "required", message: "Required" } } : {}),
        items: [{ quantity: { type: "required", message: "Required" } }],
      },
    }),
  });
  return (
    <GuardedForm form={form} onSubmit={() => undefined}>
      <Controller control={form.control} name="buyerId" render={({ field }) => <input {...field} />} />
      <Controller
        control={form.control}
        name="items.0.quantity"
        render={({ field, fieldState }) => <input {...field} aria-invalid={fieldState.invalid} />}
      />
      <button type="submit">Submit</button>
    </GuardedForm>
  );
}

describe("GuardedForm", () => {
  afterEach(() => vi.restoreAllMocks());

  it("focuses and scrolls the first rendered nested validation error into view", async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const quantity = screen.getAllByRole("textbox")[1];
    await waitFor(() => expect(quantity).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center", inline: "nearest" });
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  });

  it("prefers an earlier named autocomplete-like input over a later invalid input", async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    render(<Harness buyerInvalid />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const buyer = screen.getAllByRole("textbox")[0];
    await waitFor(() => expect(buyer).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalled();
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  });

  it("preserves the caller form ref and contains submit events by default", () => {
    const parentSubmit = vi.fn();
    const formRef = React.createRef<HTMLFormElement>();

    function SubmitHarness() {
      const form = useForm<{ name: string }>({ defaultValues: { name: "Leather" } });
      return (
        <div onSubmit={parentSubmit}>
          <GuardedForm form={form} onSubmit={() => undefined} slotProps={{ form: { ref: formRef } }}>
            <button type="submit">Save</button>
          </GuardedForm>
        </div>
      );
    }

    render(<SubmitHarness />);
    expect(formRef.current).not.toBeNull();
    expect(formRef.current?.tagName).toBe("FORM");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(parentSubmit).not.toHaveBeenCalled();
  });
});
