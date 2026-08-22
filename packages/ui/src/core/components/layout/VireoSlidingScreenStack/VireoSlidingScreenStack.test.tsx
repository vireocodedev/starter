import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoSlidingScreenStack } from "./VireoSlidingScreenStack";
import { vireoSlidingScreenStackClasses } from "./VireoSlidingScreenStack.classes";
import { VIREO_SLIDING_SCREEN_STACK_NAME } from "./VireoSlidingScreenStack.identity";

const screens = [
  { id: "overview", children: <p>Overview screen</p> },
  { id: "details", children: <p>Details screen</p> },
];

describe(VIREO_SLIDING_SCREEN_STACK_NAME, () => {
  it("retains all screens and marks only the active screen as visible", () => {
    const { container } = render(<VireoSlidingScreenStack activeScreen="details" screens={screens} />);

    expect(screen.getByText("Overview screen").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Details screen").parentElement).toHaveAttribute("aria-hidden", "false");
    expect(container.querySelector("[data-active-index='1']")).toBeInTheDocument();
  });

  it("falls back to the first screen for an unknown id", () => {
    render(<VireoSlidingScreenStack activeScreen="missing" screens={screens} />);
    expect(screen.getByText("Overview screen").parentElement).toHaveAttribute("aria-hidden", "false");
  });

  it("forwards its ref and composes public slot classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <VireoSlidingScreenStack
        ref={ref}
        activeScreen="overview"
        screens={screens}
        slotProps={{ screen: { className: "consumer-screen" } }}
      />,
    );

    expect(ref.current).toBe(container.firstElementChild);
    expect(screen.getByText("Overview screen").parentElement).toHaveClass(
      vireoSlidingScreenStackClasses.screen,
      "consumer-screen",
    );
  });

  it("supports theme defaults and slot overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_SLIDING_SCREEN_STACK_NAME]: {
          defaultProps: { className: "theme-default" },
          styleOverrides: { screen: { padding: "12px" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoSlidingScreenStack activeScreen="overview" screens={screens} />
      </ThemeProvider>,
    );

    expect(screen.getByText("Overview screen").parentElement?.parentElement?.parentElement).toHaveClass(
      "theme-default",
    );
    expect(screen.getByText("Details screen").parentElement).toHaveStyle({ padding: "12px" });
  });
});
