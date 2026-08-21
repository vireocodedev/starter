import { useVireoMultiStepForm } from "@/capabilities/forms/hooks/useVireoMultiStepForm/useVireoMultiStepForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { vireoFormStepProgressClasses } from "./VireoFormStepProgress.classes";
import { VIREO_FORM_STEP_PROGRESS_NAME } from "./VireoFormStepProgress.identity";
import type { VireoFormStepProgressProps } from "./VireoFormStepProgress.types";

function Harness({
  progressProps,
  forwardedRef,
}: {
  progressProps?: VireoFormStepProgressProps;
  forwardedRef?: React.Ref<HTMLDivElement>;
}) {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    onSubmit: () => undefined,
    steps: [
      { id: "profile", label: "Profile" },
      { id: "contact", label: "Contact" },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep>
        <form.StepProgress {...progressProps} ref={forwardedRef} />
        <form.Step id="profile">Profile content</form.Step>
        <form.Step id="contact">Contact content</form.Step>
        <form.Step id="review">Review content</form.Step>
        <button type="button" onClick={() => void form.goToNextStep()}>
          Next
        </button>
      </form.MultiStep>
    </form.Form>
  );
}

describe(VIREO_FORM_STEP_PROGRESS_NAME, () => {
  it("renders accessible ordered progress with the current step", () => {
    render(<Harness />);
    const progress = screen.getByRole("navigation", { name: "Form progress" });
    expect(progress.querySelector("ol")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Profile, Current step" })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "Contact, Upcoming" })).toBeDisabled();
  });

  it("allows navigation back to visited steps", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Contact content");
    fireEvent.click(screen.getByRole("button", { name: "Profile, Complete" }));
    await screen.findByText("Profile content");
  });

  it("opens compact direct navigation", async () => {
    render(<Harness progressProps={{ layout: "compact", navigation: "all" }} />);
    fireEvent.click(screen.getByRole("button", { name: /Profile, step 1 of 3/ }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Contact/ }));
    await screen.findByText("Contact content");
    expect(screen.getByRole("progressbar", { name: "Step 2 of 3" })).toBeInTheDocument();
  });

  it("forwards refs and exposes per-step owner state to slot props", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Harness
        forwardedRef={ref}
        progressProps={{ slotProps: { step: ({ step }) => ({ "data-current": step?.isCurrent }) } }}
      />,
    );
    expect(ref.current).toHaveClass(vireoFormStepProgressClasses.root);
    expect(ref.current?.querySelector("li")).toHaveAttribute("data-current", "true");
  });

  it("uses theme defaults and slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_STEP_PROGRESS_NAME]: {
          defaultProps: { navigation: "all" },
          styleOverrides: { root: { paddingLeft: "7px" }, statusIcon: { width: "30px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <Harness />
      </ThemeProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Form progress" })).toHaveStyle({ paddingLeft: "7px" });
    expect(screen.getByRole("button", { name: "Contact, Upcoming" })).toBeEnabled();
    expect(document.querySelector(`.${vireoFormStepProgressClasses.statusIcon}`)).toHaveStyle({ width: "30px" });
  });
});
