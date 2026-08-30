import { Button } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeInTheDocument();
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
    expect(screen.getByText("Profile form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByText("Profile form")).toHaveClass(vireoResponsiveFormOverlayClasses.content);
    expect(screen.getByRole("button", { name: "Save" }).parentElement).toHaveClass(
      vireoResponsiveFormOverlayClasses.actions,
    );
  });

  it("wraps content and persistent actions in one consumer form while keeping the header outside", () => {
    render(
      <VireoResponsiveFormOverlay
        open
        onClose={() => undefined}
        title="Edit profile"
        closeLabel="Close"
        renderForm={children => <form aria-label="Profile form">{children}</form>}
        actions={<Button>Save</Button>}
      >
        Profile fields
      </VireoResponsiveFormOverlay>,
    );

    const form = screen.getByRole("form", { name: "Profile form" });
    const formRegions = form.firstElementChild;
    expect(form.parentElement).toHaveClass(vireoResponsiveFormOverlayClasses.body);
    expect(form).toHaveTextContent("Profile fields");
    expect(form.children).toHaveLength(1);
    expect(formRegions).toHaveStyle({ display: "flex", flexDirection: "column", gap: "0" });
    expect(form).toContainElement(screen.getByText("Profile fields"));
    expect(form).toContainElement(screen.getByRole("button", { name: "Save" }));
    expect(form).not.toContainElement(screen.getByText("Edit profile"));
  });

  it("provides guarded close behavior to functional actions", () => {
    const onClose = vi.fn();
    render(
      <VireoResponsiveFormOverlay
        open
        onClose={onClose}
        title="Edit profile"
        closeLabel="Close"
        actions={({ requestClose }) => <Button onClick={requestClose}>Cancel</Button>}
      >
        Profile form
      </VireoResponsiveFormOverlay>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("blocks functional action close requests while closing is disabled", () => {
    const onClose = vi.fn();
    render(
      <VireoResponsiveFormOverlay
        open
        closeDisabled
        onClose={onClose}
        title="Edit profile"
        closeLabel="Close"
        actions={({ requestClose }) => <Button onClick={requestClose}>Cancel</Button>}
      >
        Profile form
      </VireoResponsiveFormOverlay>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("exposes normalized body state and composes body classes", () => {
    render(
      <VireoResponsiveFormOverlay
        open
        onClose={() => undefined}
        title="Edit profile"
        closeLabel="Close"
        renderForm={children => <form>{children}</form>}
        classes={{ body: "custom-body" }}
        slotProps={{ body: ownerState => ({ "data-form-wrapper": ownerState.hasFormWrapper }) }}
      >
        Profile form
      </VireoResponsiveFormOverlay>,
    );

    const body = screen.getByText("Profile form").closest(`.${vireoResponsiveFormOverlayClasses.body}`);
    expect(body).toHaveClass("custom-body");
    expect(body).toHaveAttribute("data-form-wrapper", "true");
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
