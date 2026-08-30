import { VireoTabs } from "./VireoTabs";
import { vireoTabsClasses } from "./VireoTabs.classes";
import { VIREO_TABS_NAME } from "./VireoTabs.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

describe(VIREO_TABS_NAME, () => {
  const tabs = [
    { value: "profile", label: "Profile", content: "Profile content" },
    { value: "security", label: "Security", content: "Security content" },
  ];

  it("renders its essential default output with only required props", () => {
    render(<VireoTabs tabs={tabs} />);
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Profile content");
  });

  it("changes uncontrolled selection and reports its value", () => {
    const onChange = vi.fn();
    render(<VireoTabs tabs={tabs} onChange={onChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "Security" }));
    expect(onChange).toHaveBeenCalledWith("security", expect.anything());
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security content");
  });

  it("runs the tabs slot change handler before built-in selection and the public callback", () => {
    const calls: string[] = [];
    render(
      <VireoTabs
        tabs={tabs}
        onChange={() => calls.push("public")}
        slotProps={{ tabs: { onChange: () => calls.push("slot") } }}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Security" }));

    expect(calls).toEqual(["slot", "public"]);
    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security content");
  });

  it("lets the tabs slot change handler cancel built-in selection and the public callback", () => {
    const onChange = vi.fn();
    const slotOnChange = vi.fn((event: React.SyntheticEvent) => event.preventDefault());
    render(<VireoTabs tabs={tabs} onChange={onChange} slotProps={{ tabs: { onChange: slotOnChange } }} />);

    fireEvent.click(screen.getByRole("tab", { name: "Security" }));

    expect(slotOnChange).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Profile content");
  });

  it("forwards refs and merges root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoTabs
        tabs={tabs}
        ref={forwardedRef}
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

    const root = screen.getByRole("tab", { name: "Profile" }).closest(`.${vireoTabsClasses.root}`) as HTMLElement;
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoTabsClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports a replacement root and owner-state slot props", () => {
    render(
      <VireoTabs
        tabs={tabs}
        slots={{ root: "section" }}
        slotProps={{ root: () => ({ "aria-label": "Customized VireoTabs", "data-slot": "root" }) }}
      />,
    );

    const root = screen.getByRole("region", { name: "Customized VireoTabs" });
    expect(root).toHaveAttribute("data-slot", "root");
    expect(root).toHaveClass(vireoTabsClasses.root);
  });

  it("uses theme default props and root style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_TABS_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoTabs tabs={tabs} />
      </ThemeProvider>,
    );

    const root = screen.getByRole("tab", { name: "Profile" }).closest(`.${vireoTabsClasses.root}`);
    expect(root).toHaveClass("theme-default-class");
    expect(root).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
