import { VireoOverlayHeader } from "./VireoOverlayHeader";
import { vireoOverlayHeaderClasses } from "./VireoOverlayHeader.classes";
import { VIREO_OVERLAY_HEADER_NAME } from "./VireoOverlayHeader.identity";
import { Button, ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

describe(VIREO_OVERLAY_HEADER_NAME, () => {
  it("renders its essential default semantics with only required props", () => {
    render(<VireoOverlayHeader title="Edit invoice" />);

    expect(screen.getByRole("banner").tagName).toBe("HEADER");
    expect(screen.getByRole("heading", { level: 2, name: "Edit invoice" })).toHaveAttribute("id");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("uses the provided title id", () => {
    render(<VireoOverlayHeader title="Edit invoice" titleId="invoice-title" />);

    expect(screen.getByRole("heading", { level: 2, name: "Edit invoice" })).toHaveAttribute("id", "invoice-title");
  });

  it("renders HTML-looking string titles as text", () => {
    render(<VireoOverlayHeader title="<strong>Edit invoice</strong>" />);

    expect(screen.getByRole("heading")).toHaveTextContent("<strong>Edit invoice</strong>");
    expect(screen.queryByText("Edit invoice", { selector: "strong" })).not.toBeInTheDocument();
  });

  it("renders the complete public anatomy in DOM order", () => {
    render(
      <VireoOverlayHeader
        title="Edit invoice"
        leadingAction={<Button>Back</Button>}
        actions={<Button>Save</Button>}
        closeLabel="Close invoice editor"
        onClose={vi.fn()}
      />,
    );

    const header = screen.getByRole("banner");
    const [leadingAction, title, actions, closeButton] = Array.from(header.children);
    expect(leadingAction).toHaveClass(vireoOverlayHeaderClasses.leadingAction);
    expect(title).toHaveClass(vireoOverlayHeaderClasses.title);
    expect(actions).toHaveClass(vireoOverlayHeaderClasses.actions);
    expect(closeButton).toHaveClass(vireoOverlayHeaderClasses.closeButton);
  });

  it("calls the consumer close callback unless a slot handler prevents it", () => {
    const onClose = vi.fn();
    const slotOnClick = vi.fn<React.MouseEventHandler<HTMLButtonElement>>(event => event.preventDefault());
    const { rerender } = render(
      <VireoOverlayHeader
        title="Edit invoice"
        closeLabel="Close invoice editor"
        onClose={onClose}
        slotProps={{ closeButton: { onClick: slotOnClick } }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close invoice editor" }));
    expect(slotOnClick).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();

    rerender(<VireoOverlayHeader title="Edit invoice" closeLabel="Close invoice editor" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close invoice editor" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps a disabled close button discoverable without firing close", () => {
    const onClose = vi.fn();
    render(
      <VireoOverlayHeader title="Edit invoice" closeDisabled closeLabel="Close invoice editor" onClose={onClose} />,
    );

    const closeButton = screen.getByRole("button", { name: "Close invoice editor" });
    expect(closeButton).toBeDisabled();
    fireEvent.click(closeButton);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("forwards the root ref and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLElement>();
    const rootSlotRef = React.createRef<HTMLElement>();
    render(
      <VireoOverlayHeader
        ref={forwardedRef}
        title="Edit invoice"
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
      />,
    );

    expect(forwardedRef.current).toBe(screen.getByRole("banner"));
    expect(rootSlotRef.current).toBe(forwardedRef.current);
    expect(forwardedRef.current).toHaveClass(vireoOverlayHeaderClasses.root, "direct-class", "slot-class");
    expect(forwardedRef.current).toHaveAttribute("data-origin", "slot");
    expect(forwardedRef.current).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports replacement slots and owner-state slot props", () => {
    render(
      <VireoOverlayHeader
        title="Edit invoice"
        actions={<span>Draft</span>}
        closeLabel="Close invoice editor"
        onClose={vi.fn()}
        slots={{ root: "section", title: "h3", actions: "aside", closeIcon: "span" }}
        slotProps={{
          root: ownerState => ({
            "aria-label": `Overlay header, sticky ${String(ownerState.sticky)}`,
            "data-sticky": String(ownerState.sticky),
          }),
          title: { "data-slot": "title" },
          actions: { "aria-label": "Header status" },
          closeIcon: { "data-slot": "close-icon" },
        }}
      />,
    );

    const root = screen.getByRole("region", { name: "Overlay header, sticky true" });
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-sticky", "true");
    expect(screen.getByRole("heading", { level: 3 })).toHaveAttribute("data-slot", "title");
    expect(screen.getByRole("complementary", { name: "Header status" })).toHaveTextContent("Draft");
    expect(document.querySelector('[data-slot="close-icon"]')).toHaveClass(vireoOverlayHeaderClasses.closeIcon);
  });

  it("applies custom utility classes to their matching slots", () => {
    render(
      <VireoOverlayHeader
        title="Edit invoice"
        leadingAction={<span>Back</span>}
        actions={<span>Draft</span>}
        closeLabel="Close invoice editor"
        onClose={vi.fn()}
        classes={{
          root: "custom-root",
          leadingAction: "custom-leading",
          title: "custom-title",
          actions: "custom-actions",
          closeButton: "custom-close-button",
          closeIcon: "custom-close-icon",
        }}
      />,
    );

    expect(screen.getByRole("banner")).toHaveClass("custom-root");
    expect(screen.getByRole("heading")).toHaveClass("custom-title");
    expect(screen.getByRole("button", { name: "Close invoice editor" })).toHaveClass("custom-close-button");
    expect(document.querySelector(`.${vireoOverlayHeaderClasses.leadingAction}`)).toHaveClass("custom-leading");
    expect(document.querySelector(`.${vireoOverlayHeaderClasses.actions}`)).toHaveClass("custom-actions");
    expect(document.querySelector(`.${vireoOverlayHeaderClasses.closeIcon}`)).toHaveClass("custom-close-icon");
  });

  it("uses theme default props and per-slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_OVERLAY_HEADER_NAME]: {
          defaultProps: { sticky: false },
          styleOverrides: {
            root: { borderBottomWidth: 4 },
            title: { color: "rgb(123, 45, 67)" },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoOverlayHeader
          title="Edit invoice"
          slotProps={{ root: ownerState => ({ "aria-label": `Sticky ${String(ownerState.sticky)}` }) }}
        />
      </ThemeProvider>,
    );

    expect(screen.getByRole("banner")).toHaveAttribute("aria-label", "Sticky false");
    expect(screen.getByRole("banner")).toHaveStyle({ borderBottomWidth: "4px" });
    expect(screen.getByRole("heading")).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
