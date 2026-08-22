import { ThemeProvider, createTheme } from "@mui/material";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { VireoThemeColorMeta } from "./VireoThemeColorMeta";

const themeColorMetas = () => Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));

describe("VireoThemeColorMeta", () => {
  afterEach(() => themeColorMetas().forEach(meta => meta.remove()));

  it("creates and removes an unqualified tag using the active theme", () => {
    const theme = createTheme({ palette: { background: { paper: "#123456" } } });
    const view = render(
      <ThemeProvider theme={theme}>
        <VireoThemeColorMeta />
      </ThemeProvider>,
    );
    expect(themeColorMetas()).toHaveLength(1);
    expect(themeColorMetas()[0]).toHaveAttribute("content", "#123456");
    view.unmount();
    expect(themeColorMetas()).toHaveLength(0);
  });

  it("updates and restores a pre-existing tag", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#111111";
    document.head.append(meta);
    const view = render(<VireoThemeColorMeta color="#abcdef" />);
    expect(meta).toHaveAttribute("content", "#abcdef");
    view.unmount();
    expect(meta).toHaveAttribute("content", "#111111");
    expect(meta.isConnected).toBe(true);
  });

  it("targets one media variant without deleting or changing siblings", () => {
    document.head.innerHTML += `
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
      <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
    `;
    const view = render(<VireoThemeColorMeta color="#222222" media="(prefers-color-scheme: dark)" />);
    const [light, dark] = themeColorMetas();
    expect(light).toHaveAttribute("content", "#ffffff");
    expect(dark).toHaveAttribute("content", "#222222");
    view.unmount();
    expect(themeColorMetas()).toHaveLength(2);
    expect(dark).toHaveAttribute("content", "#000000");
  });

  it("moves ownership when the media query changes", () => {
    const { rerender, unmount } = render(<VireoThemeColorMeta color="#123456" media="screen" />);
    expect(themeColorMetas()[0]).toHaveAttribute("media", "screen");
    rerender(<VireoThemeColorMeta color="#123456" media="print" />);
    expect(themeColorMetas()).toHaveLength(1);
    expect(themeColorMetas()[0]).toHaveAttribute("media", "print");
    unmount();
    expect(themeColorMetas()).toHaveLength(0);
  });
});
