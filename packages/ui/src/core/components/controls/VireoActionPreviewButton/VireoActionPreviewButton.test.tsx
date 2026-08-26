import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoActionPreviewButton } from "./VireoActionPreviewButton";
import { vireoActionPreviewButtonClasses } from "./VireoActionPreviewButton.classes";
import { VIREO_ACTION_PREVIEW_BUTTON_NAME } from "./VireoActionPreviewButton.identity";

describe(VIREO_ACTION_PREVIEW_BUTTON_NAME, () => {
  it("renders an accessible action with its consequence preview", () => {
    render(<VireoActionPreviewButton label="Delete invoice" preview="Removes invoice #1247 permanently" />);

    expect(screen.getByRole("button", { name: "Delete invoice" })).toHaveAccessibleDescription(
      "Removes invoice #1247 permanently",
    );
  });

  it("forwards button behavior and disabled state", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <VireoActionPreviewButton label="Apply filters" preview="Shows 128 matching records" onClick={onClick} />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <VireoActionPreviewButton
        disabled
        label="Apply filters"
        preview="Shows 128 matching records"
        onClick={onClick}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards refs and merges slot customization", () => {
    const forwardedRef = React.createRef<HTMLButtonElement>();
    const rootSlotRef = React.createRef<HTMLButtonElement>();

    render(
      <VireoActionPreviewButton
        ref={forwardedRef}
        className="direct-class"
        label="Save"
        preview="Commits 3 modified records"
        slotProps={{
          root: { ref: rootSlotRef, className: "slot-class", "data-origin": "slot" },
          preview: { className: "preview-class" },
        }}
      />,
    );

    const button = screen.getByRole("button");
    expect(forwardedRef.current).toBe(button);
    expect(rootSlotRef.current).toBe(button);
    expect(button).toHaveClass(vireoActionPreviewButtonClasses.root, "direct-class", "slot-class");
    expect(button).toHaveAttribute("data-origin", "slot");
    expect(screen.getByText("Commits 3 modified records")).toHaveClass(
      vireoActionPreviewButtonClasses.preview,
      "preview-class",
    );
  });

  it("supports replacement content slots and centered alignment", () => {
    render(
      <VireoActionPreviewButton
        align="center"
        label="Publish"
        preview="Makes this version available to everyone"
        slots={{ content: "strong", label: "span", preview: "small" }}
      />,
    );

    expect(screen.getByText("Publish").tagName).toBe("SPAN");
    expect(screen.getByText("Makes this version available to everyone").tagName).toBe("SMALL");
    expect(screen.getByText("Publish").parentElement?.tagName).toBe("STRONG");
  });

  it("uses theme default props and slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_ACTION_PREVIEW_BUTTON_NAME]: {
          defaultProps: { align: "center", variant: "contained" },
          styleOverrides: { preview: { fontWeight: 800 } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoActionPreviewButton label="Create item" preview="Adds one record to Items" />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button")).toHaveClass("MuiButton-contained");
    expect(screen.getByText("Adds one record to Items")).toHaveStyle({ fontWeight: "800" });
  });
});
