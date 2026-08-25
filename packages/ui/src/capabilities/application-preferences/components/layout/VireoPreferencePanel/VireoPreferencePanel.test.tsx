import { VireoPageLayoutProvider, createVireoPageLayout } from "@/capabilities/page-layout/public";
import { Button, Switch, ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoPreferencePanel } from "./VireoPreferencePanel";
import { vireoPreferencePanelClasses } from "./VireoPreferencePanel.classes";
import { VIREO_PREFERENCE_PANEL_NAME } from "./VireoPreferencePanel.identity";
import type { VireoPreferenceSectionDefinition } from "./VireoPreferencePanel.types";

const sections: readonly VireoPreferenceSectionDefinition[] = [
  {
    id: "appearance",
    title: "Appearance",
    items: [
      {
        id: "theme",
        title: "Dark mode",
        description: "Use the dark workspace palette.",
        searchKeywords: ["noćni način"],
        control: <Switch slotProps={{ input: { "aria-label": "Dark mode" } }} />,
      },
    ],
  },
  {
    id: "layout",
    title: "Layout",
    items: [
      {
        id: "density",
        title: "Table density",
        description: "Choose comfortable or compact rows.",
        control: <Button>Choose density</Button>,
      },
    ],
  },
];

function renderPanel(props: Partial<React.ComponentProps<typeof VireoPreferencePanel>> = {}) {
  return render(<VireoPreferencePanel sections={sections} emptyState="No preferences found." {...props} />);
}

describe(VIREO_PREFERENCE_PANEL_NAME, () => {
  it("renders its essential collapsed sections with only required props", () => {
    const { container } = renderPanel();

    expect(screen.getByRole("button", { name: "Appearance" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Layout" })).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector(`.${vireoPreferencePanelClasses.root}`)).toHaveClass("MuiPaper-outlined");
    expect(container.querySelector(`.${vireoPreferencePanelClasses.root}`)).toHaveStyle({ overflow: "clip" });
  });

  it("owns uncontrolled expansion and reports IDs in section order", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderPanel({ defaultExpandedSectionIds: ["layout"], onExpandedSectionIdsChange: onChange });

    await user.click(screen.getByRole("button", { name: "Appearance" }));
    expect(onChange).toHaveBeenLastCalledWith(["appearance", "layout"]);
    expect(screen.getByRole("button", { name: "Appearance" })).toHaveAttribute("aria-expanded", "true");
  });

  it("supports controlled expansion without mutating it internally", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderPanel({ expandedSectionIds: ["appearance", "unknown"], onExpandedSectionIdsChange: onChange });

    await user.click(screen.getByRole("button", { name: "Layout" }));
    expect(onChange).toHaveBeenCalledWith(["appearance", "layout"]);
    expect(screen.getByRole("button", { name: "Layout" })).toHaveAttribute("aria-expanded", "false");
  });

  it("filters diacritic-insensitively and restores manual expansion after search", () => {
    const onChange = vi.fn();
    const { rerender } = renderPanel({ defaultExpandedSectionIds: ["layout"], onExpandedSectionIdsChange: onChange });

    rerender(
      <VireoPreferencePanel
        sections={sections}
        emptyState="None"
        searchQuery="nocni"
        onExpandedSectionIdsChange={onChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Appearance" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByRole("button", { name: "Layout" })).not.toBeInTheDocument();

    rerender(<VireoPreferencePanel sections={sections} emptyState="None" onExpandedSectionIdsChange={onChange} />);
    expect(screen.getByRole("button", { name: "Layout" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Appearance" })).toHaveAttribute("aria-expanded", "false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("preserves uncontrolled expansion by ID across reorder and drops removed sections", () => {
    const { rerender } = renderPanel({ defaultExpandedSectionIds: ["appearance", "layout"] });

    rerender(<VireoPreferencePanel sections={[sections[1], sections[0]]} emptyState="None" />);
    expect(screen.getByRole("button", { name: "Appearance" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Layout" })).toHaveAttribute("aria-expanded", "true");

    rerender(<VireoPreferencePanel sections={[sections[1]]} emptyState="None" />);
    expect(screen.queryByRole("button", { name: "Appearance" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Layout" })).toHaveAttribute("aria-expanded", "true");
  });

  it("does not match a section title by itself and renders the required empty state", () => {
    renderPanel({ searchQuery: "appearance", emptyState: <strong>Nothing matched</strong> });

    expect(screen.getByText("Nothing matched")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Appearance" })).not.toBeInTheDocument();
  });

  it("keeps section actions outside the expansion toggle", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderPanel({
      sections: [{ ...sections[0], action: <Button onClick={onAction}>Reset appearance</Button> }],
    });

    await user.click(screen.getByRole("button", { name: "Reset appearance" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Appearance" })).toHaveAttribute("aria-expanded", "false");
  });

  it("consumes compact page layout and supports the sticky-header opt-out", () => {
    const { container } = render(
      <VireoPageLayoutProvider value={createVireoPageLayout("compact")}>
        <VireoPreferencePanel
          sections={sections}
          emptyState="None"
          stickySectionHeaders={false}
          slotProps={{
            root: ownerState => ({ "data-compact": ownerState.isCompact }),
            sectionHeader: ownerState => ({ "data-sticky": ownerState.stickySectionHeaders }),
          }}
        />
      </VireoPageLayoutProvider>,
    );

    expect(container.querySelector('[data-compact="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-sticky="false"]')).toBeInTheDocument();
  });

  it("forwards refs and composes root, slot, class, and repeated data customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    renderPanel({
      ref: forwardedRef,
      className: "direct-class",
      slots: { item: "article" },
      slotProps: {
        root: { ref: rootSlotRef, className: "slot-class", "data-testid": "preference-panel" },
        item: { "data-origin": "definition" },
      },
      defaultExpandedSectionIds: ["appearance"],
    });

    const root = screen.getByTestId("preference-panel");
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoPreferencePanelClasses.root, "direct-class", "slot-class");
    expect(document.querySelector('article[data-item-id="theme"]')).toHaveAttribute("data-origin", "definition");
  });

  it("uses theme default props and representative slot style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_PREFERENCE_PANEL_NAME]: {
          defaultProps: { stickySectionHeaders: false },
          styleOverrides: { sectionSummary: { color: "rgb(123, 45, 67)" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoPreferencePanel sections={sections} emptyState="None" />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "Appearance" })).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });

  it("uses distinct section and item surfaces", () => {
    const theme = createTheme({
      palette: {
        background: {
          default: "#203040",
          paper: "#102030",
        },
      },
    });
    const { container } = render(
      <ThemeProvider theme={theme}>
        <VireoPreferencePanel sections={sections} emptyState="None" defaultExpandedSectionIds={["appearance"]} />
      </ThemeProvider>,
    );

    expect(container.querySelector(`.${vireoPreferencePanelClasses.section}`)).toHaveStyle({
      backgroundColor: "#102030",
    });
    expect(container.querySelector(`.${vireoPreferencePanelClasses.item}`)).toHaveStyle({
      backgroundColor: "#203040",
    });
  });

  it("warns about duplicate section and item IDs in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderPanel({
      sections: [
        { id: "duplicate", title: "One", items: [{ ...sections[0].items[0], id: "same" }] },
        { id: "duplicate", title: "Two", items: [{ ...sections[1].items[0], id: "same" }] },
      ],
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate section id "duplicate"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate item id "same"'));
    warn.mockRestore();
  });
});
