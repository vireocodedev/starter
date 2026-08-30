import { ThemeProvider, createTheme } from "@mui/material";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VireoJsonViewer } from "./VireoJsonViewer";
import { vireoJsonViewerClasses } from "./VireoJsonViewer.classes";
import { VIREO_JSON_VIEWER_NAME } from "./VireoJsonViewer.identity";

const requiredProps = {
  data: { id: 7, active: true },
  copyLabel: "Copy JSON",
  copiedLabel: "JSON copied",
  copyErrorLabel: "Unable to copy JSON",
};

describe(VIREO_JSON_VIEWER_NAME, () => {
  const writeText = vi.fn<(text: string) => Promise<void>>();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("formats its required data and exposes an accessible copy action", () => {
    render(<VireoJsonViewer {...requiredProps} />);

    expect(screen.getByText(/"id": 7/)).toHaveTextContent('{ "id": 7, "active": true }');
    expect(screen.getByRole("button", { name: "Copy JSON" })).toBeEnabled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("serializes errors and values that native JSON cannot represent", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    render(
      <VireoJsonViewer
        {...requiredProps}
        data={{
          error: new Error("Unavailable"),
          bigint: 42n,
          callback: function retryRequest() {},
          symbol: Symbol("private"),
          missing: undefined,
          circular,
        }}
      />,
    );

    const content = screen.getByText(/"message": "Unavailable"/);
    expect(content).toHaveTextContent('"bigint": "42"');
    expect(content).toHaveTextContent("<function retryRequest>");
    expect(content).toHaveTextContent("<symbol private>");
    expect(content).toHaveTextContent("<undefined>");
    expect(content).toHaveTextContent("<circular>");
  });

  it("shows a safe fallback if serialization throws", () => {
    const data = {
      get broken() {
        throw new Error("Getter failed");
      },
    };

    render(<VireoJsonViewer {...requiredProps} data={data} />);

    expect(screen.getByText("<unable to stringify: Getter failed>")).toBeVisible();
  });

  it("copies serialized data and resets success feedback", async () => {
    vi.useFakeTimers();
    render(<VireoJsonViewer {...requiredProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    await act(async () => Promise.resolve());

    expect(writeText).toHaveBeenCalledWith('{\n  "id": 7,\n  "active": true\n}');
    expect(screen.getByRole("button", { name: "JSON copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("JSON copied");

    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole("button", { name: "Copy JSON" })).toBeInTheDocument();
  });

  it("announces clipboard failures and keeps the copy action available", async () => {
    writeText.mockRejectedValueOnce(new Error("Denied"));
    render(<VireoJsonViewer {...requiredProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "Unable to copy JSON" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Unable to copy JSON");
  });

  it("lets copy-button slot handlers prevent the built-in action", () => {
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
    render(<VireoJsonViewer {...requiredProps} slotProps={{ copyButton: { onClick } }} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("forwards refs and merges classes and root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoJsonViewer
        {...requiredProps}
        ref={forwardedRef}
        className="direct-class"
        style={{ paddingLeft: 10 }}
        classes={{ toolbar: "custom-toolbar", content: "custom-content" }}
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

    const content = screen.getByText(/"id": 7/);
    const root = content.parentElement;
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoJsonViewerClasses.root, "direct-class", "slot-class");
    expect(root).toHaveAttribute("data-origin", "slot");
    expect(root).toHaveStyle({ paddingLeft: "10px", paddingRight: "12px" });
    expect(screen.getByRole("button", { name: "Copy JSON" }).parentElement).toHaveClass(
      vireoJsonViewerClasses.toolbar,
      "custom-toolbar",
    );
    expect(content).toHaveClass(vireoJsonViewerClasses.content, "custom-content");
  });

  it("supports replacement slots and owner-state slot callbacks", () => {
    const statusRef = React.createRef<HTMLSpanElement>();
    render(
      <VireoJsonViewer
        {...requiredProps}
        maxHeight={180}
        slots={{ root: "section", status: "div", content: "code" }}
        slotProps={{
          root: ownerState => ({
            "aria-label": "Customized JSON viewer",
            "data-max-height": ownerState.maxHeight,
          }),
          status: ownerState => ({ ref: statusRef, "data-copy-status": ownerState.copyStatus }),
          content: ownerState => ({ "data-copy-state": ownerState.copied ? "copied" : "ready" }),
        }}
      />,
    );

    const root = screen.getByRole("region", { name: "Customized JSON viewer" });
    const content = screen.getByText(/"id": 7/);
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAttribute("data-max-height", "180");
    expect(content.tagName).toBe("CODE");
    expect(content).toHaveAttribute("data-copy-state", "ready");
    expect(statusRef.current).toBe(screen.getByRole("status"));
    expect(statusRef.current).toHaveAttribute("data-copy-status", "idle");
  });

  it("uses theme defaults and overrides for multiple slots", () => {
    const theme = createTheme({
      components: {
        [VIREO_JSON_VIEWER_NAME]: {
          defaultProps: { className: "theme-default-class", maxHeight: 180 },
          styleOverrides: {
            root: { borderColor: "rgb(123, 45, 67)" },
            content: { color: "rgb(76, 29, 149)" },
          },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoJsonViewer {...requiredProps} />
      </ThemeProvider>,
    );

    const content = screen.getByText(/"id": 7/);
    expect(content.parentElement).toHaveClass("theme-default-class");
    expect(content.parentElement).toHaveStyle({ borderColor: "rgb(123, 45, 67)" });
    expect(content).toHaveStyle({ color: "rgb(76, 29, 149)", maxHeight: "180px" });
  });
});
