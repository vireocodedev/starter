import { AppLayoutHeader } from "@/shell/layout/AppLayoutHeader";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shell/useAppShellContext", () => ({
  useAppShellContext: () => ({
    config: {
      brand: {},
    },
    runtime: {
      i18n: { t: (key: string) => key },
      preferences: { pageBodyMaxWidth: "lg" },
    },
  }),
}));

vi.mock("@/shell/layout/AppNavLayoutContext", () => ({
  useAppNavLayout: () => ({ isMobile: false }),
}));

vi.mock("react-router", () => ({
  useMatches: () => [
    {
      handle: {
        breadcrumb: () => "Overview",
      },
      params: {},
    },
  ],
}));

describe("AppLayoutHeader", () => {
  it("provides a title-bar drag region while keeping header actions interactive", () => {
    const { container } = render(<AppLayoutHeader actions={<button type="button">Save</button>} />);

    const titlebar = container.querySelector(".app-window-titlebar-main");
    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(titlebar).toHaveClass("app-window-titlebar");
    expect(titlebar).toContainElement(saveButton);
  });

  it("renders as a header landmark with the current route as the page's h1", () => {
    render(<AppLayoutHeader actions={null} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
  });
});
