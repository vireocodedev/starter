import { AppSkipToContentLink } from "@/shell/components/AppSkipToContentLink";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("AppSkipToContentLink", () => {
  it("points at the main content landmark", () => {
    render(<AppSkipToContentLink label="Skip to main content" />);

    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("moves focus to the target landmark on activation", () => {
    render(
      <>
        <AppSkipToContentLink label="Skip to main content" />
        <main id="main-content" tabIndex={-1}>
          Page content
        </main>
      </>,
    );

    screen.getByRole("link", { name: "Skip to main content" }).click();

    expect(document.activeElement).toBe(screen.getByText("Page content"));
  });
});
