import { useVireoMultiStepForm } from "@/capabilities/forms/hooks/useVireoMultiStepForm/useVireoMultiStepForm";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VIREO_FORM_NEXT_STEP_BUTTON_NAME } from "./VireoFormNextStepButton.identity";

function Harness({ onSubmit = () => undefined }: { onSubmit?: () => void }) {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit,
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
        <form.NextStepButton />
        <form.SubmitButton>Save</form.SubmitButton>
      </form.MultiStep>
    </form.Form>
  );
}

describe(VIREO_FORM_NEXT_STEP_BUTTON_NAME, () => {
  it("names its loading progressbar by default and preserves a consumer label", () => {
    function LoadingHarness({ label }: { label?: string }) {
      const form = useVireoMultiStepForm({
        defaultValues: {},
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
            <form.NextStepButton loading slotProps={{ loadingIndicator: { "aria-label": label } }} />
          </form.MultiStep>
        </form.Form>
      );
    }

    const { rerender } = render(<LoadingHarness />);
    expect(screen.getByRole("progressbar", { name: "Next" })).toBeInTheDocument();

    rerender(<LoadingHarness label="Validating profile" />);
    expect(screen.getByRole("progressbar", { name: "Validating profile" })).toBeInTheDocument();
  });

  it("advances before the final step and submits from the final step", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Second content");
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("can remain visible and disabled on the final step", async () => {
    function AlwaysVisibleHarness() {
      const form = useVireoMultiStepForm({
        defaultValues: {},
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
            <form.NextStepButton visibility="always" />
          </form.MultiStep>
        </form.Form>
      );
    }
    render(<AlwaysVisibleHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Second content");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
