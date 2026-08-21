import { AppMobileBottomNavigation } from "@/shell/layout/AppMobileBottomNavigation";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const defaultMobileBottomNavigation = {
  authenticatedItems: [],
  loginItem: { value: "login", label: () => "Login", icon: "log-in-01" },
  moreItem: { value: "more", label: () => "More", icon: "dots-horizontal" },
};

let mobileBottomNavigation: typeof defaultMobileBottomNavigation | undefined;

vi.mock("@vireocodedev/starter-ui", () => ({
  VireoIcon: () => null,
}));

vi.mock("@/shell/layout/AppNavLayoutContext", () => ({
  useAppNavLayout: () => ({ openMobileNav: () => undefined }),
}));

vi.mock("@/shell/useAppShellContext", () => ({
  useAppShellContext: () => ({
    config: {
      shell: { mobileBottomNavigation },
      routes: { getPath: () => "/" },
      brand: { navigation: { bottomNavHeightPx: 64 } },
    },
    runtime: {
      i18n: { t: (key: string) => key },
      navigation: { onBeforeNavigate: () => undefined },
      permissions: { canAccess: () => true },
    },
  }),
}));

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => () => undefined,
}));

describe("AppMobileBottomNavigation", () => {
  beforeEach(() => {
    mobileBottomNavigation = defaultMobileBottomNavigation;
  });

  it("renders as a labelled navigation landmark", () => {
    render(<AppMobileBottomNavigation />);

    expect(screen.getByRole("navigation", { name: "common.bottomNavigation" })).toBeInTheDocument();
  });

  it("renders nothing when the app declares no bottom navigation", () => {
    mobileBottomNavigation = undefined;

    const { container } = render(<AppMobileBottomNavigation />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
