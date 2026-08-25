import { useVireoMultiStepForm } from "@/capabilities/forms/hooks/useVireoMultiStepForm/useVireoMultiStepForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { vireoFormStepClasses } from "./VireoFormStep.classes";
import { VIREO_FORM_STEP_NAME } from "./VireoFormStep.identity";
import type { VireoFormStepProps } from "./VireoFormStep.types";

function Harness({
  reviewProps,
  reviewRef,
}: {
  reviewProps?: Omit<VireoFormStepProps, "id" | "ref">;
  reviewRef?: React.Ref<HTMLElement>;
}) {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    steps: [
      { id: "account", label: "Account" },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <form.Step id="account">Account content</form.Step>
        <form.Step id="review" {...reviewProps} ref={reviewRef}>
          Review content
        </form.Step>
      </form.MultiStep>
      <button type="button" onClick={() => void form.goToNextStep()}>
        Next test step
      </button>
    </form.Form>
  );
}

describe(VIREO_FORM_STEP_NAME, () => {
  it("renders the current step as a labelled region", () => {
    render(<Harness />);
    const step = screen.getByRole("region", { name: "Account" });
    expect(step).toHaveTextContent("Account content");
    expect(step).toHaveAttribute("tabindex", "-1");
    expect(step).toHaveClass(vireoFormStepClasses.root);
    expect(step.querySelector(`.${vireoFormStepClasses.label}`)).toHaveTextContent("Account");
  });

  it("moves focus to a newly rendered step after successful navigation", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Next test step" }));
    await waitFor(() => expect(screen.getByRole("region", { name: "Review" })).toHaveFocus());
  });

  it("exposes navigation direction to root slot customization", async () => {
    render(
      <Harness
        reviewProps={{
          slotProps: { root: ownerState => ({ "data-direction": ownerState.direction }) },
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next test step" }));
    expect(await screen.findByRole("region", { name: "Review" })).toHaveAttribute("data-direction", "forward");
  });

  it("supports root and label slot customization", async () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Harness
        reviewRef={ref}
        reviewProps={{
          className: "review-root",
          slotProps: {
            root: { "data-step": "review" },
            label: { className: "review-label" },
          },
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next test step" }));
    const step = await screen.findByRole("region", { name: "Review" });
    expect(ref.current).toBe(step);
    expect(step).toHaveClass("review-root");
    expect(step).toHaveAttribute("data-step", "review");
    expect(step.querySelector(".review-label")).toHaveClass(vireoFormStepClasses.label);
  });

  it("uses theme style overrides for the step anatomy", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_STEP_NAME]: {
          styleOverrides: { root: { paddingLeft: "9px" }, label: { width: "2px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <Harness />
      </ThemeProvider>,
    );
    expect(screen.getByRole("region", { name: "Account" })).toHaveStyle({ paddingLeft: "9px" });
  });
});
