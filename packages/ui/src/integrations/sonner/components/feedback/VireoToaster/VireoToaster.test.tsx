import { ThemeProvider, createTheme } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { toast } from "sonner";
import type { ToasterProps } from "sonner";
import { VireoToaster } from "./VireoToaster";
import { vireoToasterClasses } from "./VireoToaster.classes";
import { VIREO_TOASTER_NAME } from "./VireoToaster.identity";

function setViewportMatches(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches,
      media: "(max-width:599.95px)",
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

function toasterRoot() {
  const root = document.querySelector<HTMLElement>("[data-sonner-toaster]");
  expect(root).not.toBeNull();
  return root as HTMLElement;
}

afterEach(() => {
  toast.dismiss();
  setViewportMatches(false);
});

describe(VIREO_TOASTER_NAME, () => {
  it("passes the approved operational defaults to a compatible root slot", () => {
    let receivedProps: (ToasterProps & { sonnerTheme?: string }) | undefined;
    const RootProbe = React.forwardRef<HTMLElement, ToasterProps & { sonnerTheme?: string }>(
      function RootProbe(props, ref) {
        receivedProps = props;
        return <section ref={ref} data-testid="root-probe" className={props.className} />;
      },
    );

    render(<VireoToaster slots={{ root: RootProbe }} />);

    expect(screen.getByTestId("root-probe")).toHaveClass(vireoToasterClasses.root);
    expect(receivedProps).toMatchObject({
      closeButton: true,
      containerAriaLabel: "Notifications",
      dir: "ltr",
      duration: 3000,
      expand: false,
      gap: 14,
      hotkey: ["altKey", "KeyT"],
      position: "bottom-right",
      richColors: true,
      sonnerTheme: "light",
      swipeDirections: ["right"],
      visibleToasts: 3,
    });
  });

  it("renders the approved desktop defaults from the active MUI theme", async () => {
    setViewportMatches(false);
    const theme = createTheme({ palette: { mode: "dark" }, direction: "rtl" });

    render(
      <ThemeProvider theme={theme}>
        <VireoToaster id="desktop-defaults" />
      </ThemeProvider>,
    );
    act(() => {
      toast("Desktop", { toasterId: "desktop-defaults", duration: Infinity });
    });
    await screen.findByText("Desktop");

    const root = toasterRoot();
    expect(root).toHaveClass(vireoToasterClasses.root);
    expect(root).toHaveAttribute("dir", "rtl");
    expect(root).toHaveAttribute("data-sonner-theme", "dark");
    expect(root).toHaveAttribute("data-x-position", "right");
    expect(root).toHaveAttribute("data-y-position", "bottom");
    expect(screen.getByLabelText(/Notifications/)).toBeInTheDocument();
    expect(root.style.getPropertyValue("--gap")).toBe("14px");
    expect(root.style.getPropertyValue("--offset-bottom")).toBe("24px");
  });

  it("uses top-center safe-area defaults on mobile", async () => {
    setViewportMatches(true);

    render(<VireoToaster id="mobile-defaults" />);
    act(() => {
      toast("Mobile", { toasterId: "mobile-defaults", duration: Infinity });
    });
    await screen.findByText("Mobile");

    const root = toasterRoot();
    expect(root).toHaveAttribute("data-x-position", "center");
    expect(root).toHaveAttribute("data-y-position", "top");
    expect(root.style.getPropertyValue("--mobile-offset-top")).toContain("safe-area-inset-top");
  });

  it("preserves explicit responsive overrides", async () => {
    setViewportMatches(true);

    render(
      <VireoToaster
        id="explicit-overrides"
        position="bottom-left"
        closeButton
        offset={32}
        swipeDirections={["left"]}
        containerAriaLabel="Activity updates"
      />,
    );
    act(() => {
      toast("Explicit", { toasterId: "explicit-overrides", duration: Infinity });
    });
    await screen.findByText("Explicit");

    const root = toasterRoot();
    expect(root).toHaveAttribute("data-x-position", "left");
    expect(root).toHaveAttribute("data-y-position", "bottom");
    expect(screen.getByLabelText(/Activity updates/)).toBeInTheDocument();
    expect(root.style.getPropertyValue("--mobile-offset-bottom")).toBe("32px");
  });

  it("forwards the real Sonner root ref and merges Vireo root customization", async () => {
    const forwardedRef = React.createRef<HTMLElement>();
    const rootSlotRef = React.createRef<HTMLElement>();
    let resolvedPosition: string | undefined;

    render(
      <VireoToaster
        id="root-customization"
        ref={forwardedRef}
        className="direct-class"
        sx={{ outline: "2px solid rgb(1, 2, 3)" }}
        slotProps={{
          root: ownerState => {
            resolvedPosition = ownerState.position;
            return { ref: rootSlotRef, className: "slot-class" };
          },
        }}
      />,
    );
    act(() => {
      toast("Customized", { toasterId: "root-customization", duration: Infinity });
    });
    await screen.findByText("Customized");

    const root = toasterRoot();
    expect(forwardedRef.current).toBe(screen.getByLabelText(/Notifications/));
    expect(rootSlotRef.current).toBe(screen.getByLabelText(/Notifications/));
    expect(root).toHaveClass(vireoToasterClasses.root, "direct-class", "slot-class");
    expect(resolvedPosition).toBe("bottom-right");
    expect(root).toHaveStyle({ outline: "2px solid rgb(1, 2, 3)" });
  });

  it("merges theme and direct toast option styles and classes", async () => {
    const theme = createTheme({
      components: {
        [VIREO_TOASTER_NAME]: {
          defaultProps: {
            toastOptions: {
              classNames: { toast: "theme-toast", title: "theme-title" },
              style: { paddingLeft: 18 },
            },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoToaster
          id="merge-test"
          toastOptions={{ classNames: { toast: "direct-toast" }, style: { paddingRight: 20 } }}
        />
      </ThemeProvider>,
    );

    act(() => {
      toast.success("Merged toast", { toasterId: "merge-test", duration: Infinity });
    });

    const toastElement = (await screen.findByText("Merged toast")).closest("[data-sonner-toast]");
    expect(toastElement).toHaveClass("theme-toast", "direct-toast");
    expect(toastElement).toHaveStyle({ paddingLeft: "18px", paddingRight: "20px" });
    expect(screen.getByText("Merged toast")).toHaveClass("theme-title");
  });

  it("applies theme default props and root style overrides", async () => {
    const theme = createTheme({
      components: {
        [VIREO_TOASTER_NAME]: {
          defaultProps: { className: "theme-default-class" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoToaster id="theme-contract" />
      </ThemeProvider>,
    );
    act(() => {
      toast("Themed", { toasterId: "theme-contract", duration: Infinity });
    });
    await screen.findByText("Themed");

    expect(toasterRoot()).toHaveClass("theme-default-class");
    expect(toasterRoot()).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
