import { AppMobileBottomNavigation } from "@/shell/layout/AppMobileBottomNavigation";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@vireocodedev/starter-ui", () => ({
  RgoIcon: () => null,
}));

vi.mock("@/shell/layout/AppNavLayoutContext", () => ({
  useAppNavLayout: () => ({ openMobileNav: () => undefined }),
}));

vi.mock("@/shell/useAppShellContext", () => ({
  useAppShellContext: () => ({
    config: {
      shell: {
        mobileBottomNavigation: {
          authenticatedItems: [],
          loginItem: { value: "login", label: () => "Login", icon: "log-in-01" },
          moreItem: { value: "more", label: () => "More", icon: "dots-horizontal" },
        },
      },
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
  it("renders as a labelled navigation landmark", () => {
    render(<AppMobileBottomNavigation />);

    expect(screen.getByRole("navigation", { name: "common.bottomNavigation" })).toBeInTheDocument();
  });
});
