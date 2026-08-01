import { AppLayoutNav } from "@/shell/layout/AppLayoutNav";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shell/useAppShellContext", () => ({
  useAppShellContext: () => ({
    config: {
      shell: {
        navEntries: [],
        loginNavEntries: [],
        navControls: undefined,
        navSlots: undefined,
        accountSlot: undefined,
      },
    },
    runtime: {
      i18n: { t: (key: string) => key },
      permissions: { canAccess: () => true },
    },
  }),
}));

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => () => undefined,
}));

vi.mock("@rgo/front-ui", () => ({
  RgoIcon: () => null,
}));

vi.mock("@/shell/layout/nav/AppNavHeader", () => ({ AppNavHeader: () => null }));
vi.mock("@/shell/layout/nav/AppNavList", () => ({ AppNavList: () => null }));
vi.mock("@/shell/layout/nav/AppNavControlPopover", () => ({ AppNavControlPopover: () => null }));
vi.mock("@/shell/layout/nav/AppNavResizeHandle", () => ({ AppNavResizeHandle: () => null }));

describe("AppLayoutNav", () => {
  it("renders as a labelled navigation landmark", () => {
    render(<AppLayoutNav width={280} collapsed={false} mobile={false} />);

    expect(screen.getByRole("navigation", { name: "common.mainNavigation" })).toBeInTheDocument();
  });
});
