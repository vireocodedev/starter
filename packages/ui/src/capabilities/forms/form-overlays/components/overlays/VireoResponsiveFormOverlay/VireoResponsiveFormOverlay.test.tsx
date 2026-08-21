import { Button } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoResponsiveFormOverlay } from "./VireoResponsiveFormOverlay";
import { vireoResponsiveFormOverlayClasses } from "./VireoResponsiveFormOverlay.classes";
import { VIREO_RESPONSIVE_FORM_OVERLAY_NAME } from "./VireoResponsiveFormOverlay.identity";

describe(VIREO_RESPONSIVE_FORM_OVERLAY_NAME, () => {
  it("renders the responsive frame with only required props", () => {
    render(
      <VireoResponsiveFormOverlay
        open={false}
        onClose={() => undefined}
        title="Edit profile"
        closeLabel="Close"
        data-testid="overlay"
      >
        Profile form
      </VireoResponsiveFormOverlay>,
    );
    expect(screen.getByTestId("overlay")).toHaveClass(vireoResponsiveFormOverlayClasses.root);
  });

  it("renders its header, content, and actions when open", () => {
    render(
      <VireoResponsiveFormOverlay
        open
        onClose={() => undefined}
        title="Edit profile"
        closeLabel="Close"
        actions={<Button>Save</Button>}
      >
        Profile form
      </VireoResponsiveFormOverlay>,
    );
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
    expect(screen.getByText("Profile form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("blocks close interactions while disabled", () => {
    const onClose = vi.fn();
    render(
      <VireoResponsiveFormOverlay open closeDisabled onClose={onClose} title="Edit profile" closeLabel="Close">
        Profile form
      </VireoResponsiveFormOverlay>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("forwards the frame root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoResponsiveFormOverlay
        ref={ref}
        open={false}
        onClose={() => undefined}
        title="Edit profile"
        closeLabel="Close"
      >
        Profile form
      </VireoResponsiveFormOverlay>,
    );
    expect(ref.current).toHaveClass(vireoResponsiveFormOverlayClasses.root);
  });
});
