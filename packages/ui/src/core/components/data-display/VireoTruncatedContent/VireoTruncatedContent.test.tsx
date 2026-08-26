import { VireoTruncatedContent } from "./VireoTruncatedContent";
import { vireoTruncatedContentClasses } from "./VireoTruncatedContent.classes";
import { VIREO_TRUNCATED_CONTENT_NAME } from "./VireoTruncatedContent.identity";
import { ThemeProvider, createTheme } from "@mui/material";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type ContentDimensions = {
  scrollHeight: number;
  scrollWidth: number;
  clientWidth: number;
};

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  readonly callback: ResizeObserverCallback;
  readonly observedElements = new Set<Element>();
  readonly observe = vi.fn((element: Element) => this.observedElements.add(element));
  readonly unobserve = vi.fn((element: Element) => this.observedElements.delete(element));
  readonly disconnect = vi.fn(() => this.observedElements.clear());

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  emit(elements: Element[] = [...this.observedElements]) {
    this.callback(
      elements.map(
        target =>
          ({
            target,
          }) as ResizeObserverEntry,
      ),
      this as unknown as ResizeObserver,
    );
  }
}

let nextAnimationFrameHandle = 1;
const animationFrameCallbacks = new Map<number, FrameRequestCallback>();
const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
  const handle = nextAnimationFrameHandle++;
  animationFrameCallbacks.set(handle, callback);
  return handle;
});
const cancelAnimationFrameMock = vi.fn((handle: number) => animationFrameCallbacks.delete(handle));

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("requestAnimationFrame", requestAnimationFrameMock);
vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);

let defaultContentDimensions: ContentDimensions;
let contentDimensions: WeakMap<HTMLElement, ContentDimensions>;

function setDefaultContentDimensions(dimensions: Partial<ContentDimensions>) {
  defaultContentDimensions = { ...defaultContentDimensions, ...dimensions };
}

function setContentDimensions(element: HTMLElement, dimensions: Partial<ContentDimensions>) {
  contentDimensions.set(element, { ...defaultContentDimensions, ...contentDimensions.get(element), ...dimensions });
}

function getContentElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`.${vireoTruncatedContentClasses.content}`));
}

function flushAnimationFrames() {
  const callbacks = [...animationFrameCallbacks.values()];
  animationFrameCallbacks.clear();
  for (const callback of callbacks) callback(performance.now());
}

const requiredProps = { expandLabel: "Show more", collapseLabel: "Show less" } as const;

beforeEach(() => {
  defaultContentDimensions = { scrollHeight: 40, scrollWidth: 100, clientWidth: 100 };
  contentDimensions = new WeakMap();
  ResizeObserverMock.instances.length = 0;
  animationFrameCallbacks.clear();
  nextAnimationFrameHandle = 1;
  requestAnimationFrameMock.mockClear();
  cancelAnimationFrameMock.mockClear();

  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    return contentDimensions.get(this)?.scrollHeight ?? defaultContentDimensions.scrollHeight;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return contentDimensions.get(this)?.scrollWidth ?? defaultContentDimensions.scrollWidth;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return contentDimensions.get(this)?.clientWidth ?? defaultContentDimensions.clientWidth;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  animationFrameCallbacks.clear();
});

describe(VIREO_TRUNCATED_CONTENT_NAME, () => {
  it("renders arbitrary content without a toggle when it does not overflow", () => {
    render(
      <VireoTruncatedContent {...requiredProps}>
        <strong>Short content</strong>
      </VireoTruncatedContent>,
    );

    expect(screen.getByText("Short content")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("reveals an accessible toggle for vertical overflow and expands and collapses uncontrolled content", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    const onExpandedChange = vi.fn();
    render(
      <VireoTruncatedContent {...requiredProps} onExpandedChange={onExpandedChange}>
        Long content
      </VireoTruncatedContent>,
    );

    const expandToggle = screen.getByRole("button", { name: "Show more" });
    const viewport = document.getElementById(expandToggle.getAttribute("aria-controls")!);
    expect(expandToggle).toHaveAttribute("aria-expanded", "false");
    expect(viewport).toHaveStyle({ maxHeight: "40px", overflow: "hidden" });

    fireEvent.click(expandToggle);
    const collapseToggle = screen.getByRole("button", { name: "Show less" });
    expect(collapseToggle).toHaveAttribute("aria-expanded", "true");
    expect(viewport).toHaveStyle({ maxHeight: "none", overflow: "visible" });
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(collapseToggle);
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-expanded", "false");
    expect(viewport).toHaveStyle({ maxHeight: "40px", overflow: "hidden" });
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  it("reveals the toggle for horizontal overflow", () => {
    setDefaultContentDimensions({ scrollWidth: 160, clientWidth: 100 });
    render(<VireoTruncatedContent {...requiredProps}>Unbroken-content</VireoTruncatedContent>);

    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-expanded", "false");
  });

  it("supports an initially expanded uncontrolled state", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    render(
      <VireoTruncatedContent {...requiredProps} defaultExpanded>
        Long content
      </VireoTruncatedContent>,
    );

    const toggle = screen.getByRole("button", { name: "Show less" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(toggle.getAttribute("aria-controls")!)).toHaveStyle({
      maxHeight: "none",
      overflow: "visible",
    });
  });

  it("supports controlled expansion and reports requested changes without changing state itself", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <VireoTruncatedContent {...requiredProps} expanded={false} onExpandedChange={onExpandedChange}>
        Long content
      </VireoTruncatedContent>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-expanded", "false");

    rerender(
      <VireoTruncatedContent {...requiredProps} expanded onExpandedChange={onExpandedChange}>
        Long content
      </VireoTruncatedContent>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show less" }));
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
  });

  it("remeasures observed content and resets uncontrolled expansion when overflow disappears", () => {
    render(<VireoTruncatedContent {...requiredProps}>Responsive content</VireoTruncatedContent>);
    const content = getContentElements()[0]!;
    const observer = ResizeObserverMock.instances[0]!;
    expect(observer.observe).toHaveBeenCalledWith(content);

    setContentDimensions(content, { scrollHeight: 80 });
    act(() => observer.emit([content]));
    expect(requestAnimationFrameMock).toHaveBeenCalledOnce();
    act(flushAnimationFrames);
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    const viewport = content.parentElement;
    expect(viewport).toHaveStyle({ maxHeight: "none" });

    setContentDimensions(content, { scrollHeight: 40 });
    act(() => observer.emit([content]));
    act(flushAnimationFrames);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(viewport).toHaveStyle({ maxHeight: "40px", overflow: "hidden" });
  });

  it("shares one observer, batches resize checks, and cancels pending work after the last unmount", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { unmount } = render(
      <>
        <VireoTruncatedContent {...requiredProps}>First content</VireoTruncatedContent>
        <VireoTruncatedContent {...requiredProps}>Second content</VireoTruncatedContent>
      </>,
    );
    const contents = getContentElements();
    const observer = ResizeObserverMock.instances[0]!;
    expect(ResizeObserverMock.instances).toHaveLength(1);
    expect(observer.observe).toHaveBeenCalledTimes(2);

    for (const content of contents) setContentDimensions(content, { scrollHeight: 80 });
    act(() => observer.emit(contents));
    expect(requestAnimationFrameMock).toHaveBeenCalledOnce();
    act(flushAnimationFrames);
    expect(screen.getAllByRole("button", { name: "Show more" })).toHaveLength(2);
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("Cannot update a component");

    act(() => observer.emit(contents));
    const pendingHandle = requestAnimationFrameMock.mock.results.at(-1)?.value;
    unmount();
    expect(observer.unobserve).toHaveBeenCalledTimes(2);
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(cancelAnimationFrameMock).toHaveBeenCalledWith(pendingHandle);
  });

  it("composes toggle events and stops click propagation when requested", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    const parentOnClick = vi.fn();
    const slotOnClick = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <div onClick={parentOnClick}>
        <VireoTruncatedContent
          {...requiredProps}
          stopPropagation
          onExpandedChange={onExpandedChange}
          slotProps={{ toggle: { onClick: slotOnClick } }}
        >
          Long content
        </VireoTruncatedContent>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(slotOnClick).toHaveBeenCalledOnce();
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(parentOnClick).not.toHaveBeenCalled();
  });

  it("lets a slot handler cancel expansion without defeating requested propagation suppression", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    const parentOnClick = vi.fn();
    const onExpandedChange = vi.fn();
    const slotOnClick = vi.fn<React.MouseEventHandler<HTMLButtonElement>>(event => event.preventDefault());
    render(
      <div onClick={parentOnClick}>
        <VireoTruncatedContent
          {...requiredProps}
          stopPropagation
          onExpandedChange={onExpandedChange}
          slotProps={{ toggle: { onClick: slotOnClick } }}
        >
          Long content
        </VireoTruncatedContent>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(slotOnClick).toHaveBeenCalledOnce();
    expect(onExpandedChange).not.toHaveBeenCalled();
    expect(parentOnClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-expanded", "false");
  });

  it("forwards refs and merges inherited and root slot customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();
    render(
      <VireoTruncatedContent
        {...requiredProps}
        ref={forwardedRef}
        role="region"
        aria-label="Truncated description"
        className="direct-class"
        data-origin="direct"
        style={{ paddingLeft: 10 }}
        slotProps={{
          root: {
            ref: rootSlotRef,
            className: "slot-class",
            "data-origin": "slot",
            style: { paddingRight: 12 },
          },
        }}
      >
        Content
      </VireoTruncatedContent>,
    );

    const root = screen.getByRole("region", { name: "Truncated description" });
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoTruncatedContentClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
  });

  it("supports replacement slots and owner-state slot props", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    render(
      <VireoTruncatedContent
        {...requiredProps}
        collapsedHeight={32}
        slots={{ root: "section", viewport: "article", content: "main" }}
        slotProps={{
          root: { "aria-label": "Expandable details" },
          viewport: { "data-slot": "viewport" },
          content: ownerState => ({ "data-collapsed-height": ownerState.collapsedHeight }),
          toggle: ownerState => ({ "data-can-expand": String(ownerState.canExpand) }),
        }}
      >
        Rich content
      </VireoTruncatedContent>,
    );

    expect(screen.getByRole("region", { name: "Expandable details" }).tagName).toBe("SECTION");
    expect(screen.getByRole("article")).toHaveAttribute("data-slot", "viewport");
    expect(screen.getByRole("main")).toHaveAttribute("data-collapsed-height", "32");
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("data-can-expand", "true");
  });

  it("composes generated and custom utility classes onto every slot", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    render(
      <VireoTruncatedContent
        {...requiredProps}
        classes={{
          root: "custom-root",
          viewport: "custom-viewport",
          content: "custom-content",
          toggle: "custom-toggle",
        }}
      >
        Content
      </VireoTruncatedContent>,
    );

    const toggle = screen.getByRole("button", { name: "Show more" });
    const viewport = document.getElementById(toggle.getAttribute("aria-controls")!);
    expect(toggle).toHaveClass(vireoTruncatedContentClasses.toggle, "custom-toggle");
    expect(viewport).toHaveClass(vireoTruncatedContentClasses.viewport, "custom-viewport");
    expect(screen.getByText("Content")).toHaveClass(vireoTruncatedContentClasses.content, "custom-content");
    expect(viewport?.parentElement).toHaveClass(vireoTruncatedContentClasses.root, "custom-root");
  });

  it("uses theme default props and per-slot style overrides", () => {
    setDefaultContentDimensions({ scrollHeight: 80 });
    const theme = createTheme({
      components: {
        [VIREO_TRUNCATED_CONTENT_NAME]: {
          defaultProps: { collapsedHeight: 24 },
          styleOverrides: {
            root: { backgroundColor: "rgb(10, 20, 30)" },
            content: { color: "rgb(123, 45, 67)" },
            toggle: { fontWeight: 700 },
          },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoTruncatedContent {...requiredProps}>Content</VireoTruncatedContent>
      </ThemeProvider>,
    );

    const content = screen.getByText("Content");
    const toggle = screen.getByRole("button", { name: "Show more" });
    const viewport = document.getElementById(toggle.getAttribute("aria-controls")!);
    expect(viewport?.parentElement).toHaveStyle({ backgroundColor: "rgb(10, 20, 30)" });
    expect(content).toHaveStyle({ color: "rgb(123, 45, 67)" });
    expect(toggle).toHaveStyle({ fontWeight: "700" });
    expect(viewport).toHaveStyle({ maxHeight: "24px" });
  });
});
