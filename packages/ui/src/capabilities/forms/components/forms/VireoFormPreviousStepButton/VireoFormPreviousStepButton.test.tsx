import { useVireoMultiStepForm } from "@/capabilities/forms/hooks/useVireoMultiStepForm/useVireoMultiStepForm";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME } from "./VireoFormPreviousStepButton.identity";

function Harness({ visibility = "auto" }: { visibility?: "auto" | "always" }) {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    initialStepId: "second",
    onSubmit: () => undefined,
    steps: [
      { id: "first", label: "First" },
      { id: "second", label: "Second" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <form.Step id="first">First content</form.Step>
        <form.Step id="second">Second content</form.Step>
        <form.PreviousStepButton visibility={visibility} />
      </form.MultiStep>
    </form.Form>
  );
}

describe(VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME, () => {
  it("returns to the previous step and hides automatically on the first step", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await screen.findByText("First content");
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
  });

  it("can remain visible and disabled on the first step", async () => {
    render(<Harness visibility="always" />);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await screen.findByText("First content");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });
});
