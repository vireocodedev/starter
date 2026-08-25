import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { revalidateLogic } from "@tanstack/react-form";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { useVireoMultiStepForm } from "./useVireoMultiStepForm";

function NavigationHarness({ onStepChange }: { onStepChange?: (event: { stepId: string; reason: string }) => void }) {
  const form = useVireoMultiStepForm({
    defaultValues: { includeBilling: true },
    onStepChange,
    steps: [
      { id: "account", label: "Account" },
      { id: "billing", label: "Billing", when: values => values.includeBilling },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <form.Step id="account">Account content</form.Step>
        <form.Step id="billing">Billing content</form.Step>
        <form.Step id="review">Review content</form.Step>
      </form.MultiStep>
      <form.MultiStepSubscribe selector={state => state.currentStepId}>
        {stepId => <output>Current: {stepId}</output>}
      </form.MultiStepSubscribe>
      <button type="button" onClick={() => void form.goToNextStep()}>
        Next
      </button>
      <button type="button" onClick={() => void form.goToPreviousStep()}>
        Previous
      </button>
      <button type="button" onClick={() => void form.goToStep("review")}>
        Review directly
      </button>
      <button type="button" onClick={() => form.setFieldValue("includeBilling", false)}>
        Hide billing
      </button>
      <button type="button" onClick={() => form.reset()}>
        Reset
      </button>
    </form.Form>
  );
}

function ValidationHarness() {
  const form = useVireoMultiStepForm({
    defaultValues: { email: "", name: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        email: z.email("Enter an email"),
        name: z.string().min(1, "Enter a name"),
      }),
    },
    steps: [
      { id: "profile", label: "Profile", fields: ["name", "email"] },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <form.Step id="profile">
          <form.Field name="name">
            {field => <field.TextField slotProps={{ htmlInput: { "aria-label": "Name" } }} />}
          </form.Field>
          <form.Field name="email">
            {field => <field.TextField slotProps={{ htmlInput: { "aria-label": "Email" } }} />}
          </form.Field>
        </form.Step>
        <form.Step id="review">Ready to review</form.Step>
      </form.MultiStep>
      <button type="button" onClick={() => void form.goToNextStep()}>
        Continue
      </button>
    </form.Form>
  );
}

describe("useVireoMultiStepForm", () => {
  it("navigates in order and publishes reactive state", async () => {
    render(<NavigationHarness />);
    expect(screen.getByText("Current: account")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Billing content");
    expect(screen.getByText("Current: billing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await screen.findByText("Account content");
  });

  it("stops direct forward navigation at the first incomplete intermediate step", async () => {
    render(<NavigationHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Review directly" }));
    await screen.findByText("Billing content");
    expect(screen.queryByText("Review content")).not.toBeInTheDocument();
  });

  it("omits conditional steps and reconciles the current step", async () => {
    render(<NavigationHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Billing content");
    fireEvent.click(screen.getByRole("button", { name: "Hide billing" }));
    await screen.findByText("Account content");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Review content");
  });

  it("validates owned fields, reveals errors, and advances after correction", async () => {
    render(
      <React.StrictMode>
        <ValidationHarness />
      </React.StrictMode>,
    );
    expect(screen.queryByText("Enter a name")).not.toBeInTheDocument();
    expect(screen.queryByText("Enter an email")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("Enter a name")).toBeInTheDocument();
    expect(screen.getByText("Enter an email")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Profile" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Northstar" } });
    await waitFor(() => expect(screen.queryByText("Enter a name")).not.toBeInTheDocument());
    expect(screen.getByText("Enter an email")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "owner@example.com" } });
    await waitFor(() => expect(screen.queryByText("Enter an email")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText("Ready to review");
  });

  it("resets values and multi-step navigation together", async () => {
    render(<NavigationHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Billing content");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await screen.findByText("Account content");
    expect(screen.getByText("Current: account")).toBeInTheDocument();
  });

  it("emits successful step changes but not initialization", async () => {
    const onStepChange = vi.fn();
    render(<NavigationHarness onStepChange={onStepChange} />);
    expect(onStepChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(onStepChange).toHaveBeenCalledTimes(1));
    expect(onStepChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        previousStepId: "account",
        stepId: "billing",
        reason: "next",
        direction: "forward",
      }),
    );
  });

  it("rejects duplicate ids and overlapping hierarchical ownership", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    function DuplicateHarness() {
      useVireoMultiStepForm({
        defaultValues: {},
        steps: [
          { id: "same", label: "One" },
          { id: "same", label: "Two" },
        ],
      });
      return null;
    }
    expect(() => render(<DuplicateHarness />)).toThrow(/duplicated/);

    function OverlapHarness() {
      useVireoMultiStepForm({
        defaultValues: { account: { name: "" } },
        steps: [
          { id: "one", label: "One", fields: ["account"] },
          { id: "two", label: "Two", fields: ["account.name"] },
        ],
      });
      return null;
    }
    expect(() => render(<OverlapHarness />)).toThrow(/ownership overlaps/);
    consoleError.mockRestore();
  });
});
