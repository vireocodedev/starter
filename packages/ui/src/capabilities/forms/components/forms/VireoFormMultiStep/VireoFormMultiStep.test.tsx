import { useVireoMultiStepForm } from "@/capabilities/forms/hooks/useVireoMultiStepForm/useVireoMultiStepForm";
import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { vireoFormMultiStepClasses } from "./VireoFormMultiStep.classes";
import { VIREO_FORM_MULTI_STEP_NAME } from "./VireoFormMultiStep.identity";
import type { VireoFormMultiStepProps } from "./VireoFormMultiStep.types";

type HarnessProps = { multiStepProps?: VireoFormMultiStepProps; forwardedRef?: React.Ref<HTMLDivElement> };

function Harness({ forwardedRef, multiStepProps }: HarnessProps) {
  const form = useVireoMultiStepForm({
    defaultValues: { name: "Northstar" },
    steps: [
      { id: "profile", label: "Profile", fields: ["name"] },
      { id: "review", label: "Review" },
    ],
  });
  return (
    <form.Form>
      <form.MultiStep {...multiStepProps} ref={forwardedRef}>
        <form.Step id="profile">Profile content</form.Step>
        <form.Step id="review">Review content</form.Step>
      </form.MultiStep>
    </form.Form>
  );
}

describe(VIREO_FORM_MULTI_STEP_NAME, () => {
  it("renders one active step through the bound form API", () => {
    render(<Harness />);
    expect(screen.getByText("Profile content")).toBeVisible();
    expect(screen.queryByText("Review content")).not.toBeInTheDocument();
    expect(screen.getByText("Profile content").parentElement).toHaveClass(vireoFormMultiStepClasses.root);
  });

  it("keeps applicable inactive steps mounted and hidden when requested", () => {
    render(<Harness multiStepProps={{ keepMounted: true }} />);
    expect(screen.getByText("Review content")).toHaveAttribute("hidden");
  });

  it("forwards refs and merges root slot customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    render(
      <Harness
        forwardedRef={forwardedRef}
        multiStepProps={{
          className: "direct-class",
          slotProps: { root: { ref: rootSlotRef, className: "slot-class", "data-origin": "slot" } },
        }}
      />,
    );
    const root = screen.getByText("Profile content").parentElement;
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoFormMultiStepClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
  });

  it("supports a semantic replacement root and theme defaults", () => {
    const theme = createTheme({
      components: {
        [VIREO_FORM_MULTI_STEP_NAME]: {
          defaultProps: { slots: { root: "section" }, slotProps: { root: { "aria-label": "Setup" } } },
          styleOverrides: { root: { paddingLeft: "7px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <Harness />
      </ThemeProvider>,
    );
    expect(screen.getByRole("region", { name: "Setup" })).toHaveStyle({ paddingLeft: "7px" });
  });
});
