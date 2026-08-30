import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VireoPage } from "./VireoPage";
import { vireoPageClasses } from "./VireoPage.classes";
import { VIREO_PAGE_NAME } from "./VireoPage.identity";

function rect(width: number): DOMRect {
  return {
    bottom: 100,
    height: 100,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

function installResizeObserverMock() {
  const disconnect = vi.fn();
  const observe = vi.fn();
  let callback: ResizeObserverCallback | undefined;
  let observer: ResizeObserver | undefined;

  class MockResizeObserver {
    constructor(nextCallback: ResizeObserverCallback) {
      callback = nextCallback;
      observer = this as unknown as ResizeObserver;
    }

    disconnect = disconnect;
    observe = observe;
    unobserve = vi.fn();
  }

  vi.stubGlobal("ResizeObserver", MockResizeObserver);

  return {
    disconnect,
    observe,
    resize() {
      if (!callback || !observer) throw new Error("ResizeObserver was not initialized.");
      callback([], observer);
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe(VIREO_PAGE_NAME, () => {
  it("provides a controlled container mode and forwards its root ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoPage ref={ref} mode="wide">
        Content
      </VireoPage>,
    );
    expect(screen.getByText("Content")).toHaveAttribute("data-vireo-page-mode", "wide");
    expect(ref.current).toHaveClass(vireoPageClasses.root);
  });
  it("supports root slot customization", () => {
    render(
      <VireoPage mode="regular" slots={{ root: "section" }} slotProps={{ root: { "aria-label": "Workspace" } }}>
        Content
      </VireoPage>,
    );
    expect(screen.getByRole("region", { name: "Workspace" })).toHaveClass(vireoPageClasses.root);
  });

  it("hydrates from one deterministic server mode before resolving the embedded container", async () => {
    installResizeObserverMock();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect(480));
    const container = document.createElement("div");
    document.body.append(container);
    let root: Root | undefined;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const page = (
      <VireoPage>
        <span>Embedded content</span>
      </VireoPage>
    );
    const browserWindow = window;
    vi.stubGlobal("window", undefined);
    const serverHtml = renderToString(page);
    vi.stubGlobal("window", browserWindow);

    expect(serverHtml).toContain('data-vireo-page-mode="regular"');
    expect(serverHtml).not.toContain('data-vireo-page-mode="wide"');
    container.innerHTML = serverHtml;

    await act(async () => {
      root = hydrateRoot(container, page);
    });
    await waitFor(() =>
      expect(container.querySelector(`.${vireoPageClasses.root}`)).toHaveAttribute("data-vireo-page-mode", "compact"),
    );
    expect(consoleError).not.toHaveBeenCalled();

    act(() => root?.unmount());
    container.remove();
  });

  it("observes its container, accounts for reserved inline space, and disconnects on unmount", async () => {
    const resizeObserver = installResizeObserverMock();
    let width = 650;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => rect(width));
    let scheduledFrame: FrameRequestCallback | undefined;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        scheduledFrame = callback;
        return 1;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const { unmount } = render(<VireoPage reservedInlineSize={100}>Content</VireoPage>);
    const page = screen.getByText("Content");

    await waitFor(() => expect(page).toHaveAttribute("data-vireo-page-mode", "compact"));
    expect(resizeObserver.observe).toHaveBeenCalledWith(page);

    width = 1230;
    act(() => resizeObserver.resize());
    expect(scheduledFrame).toBeDefined();
    act(() => scheduledFrame?.(0));
    await waitFor(() => expect(page).toHaveAttribute("data-vireo-page-mode", "wide"));

    unmount();
    expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
  });
});
