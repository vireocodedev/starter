import { VireoIconRegistryProvider } from "@/core/providers/VireoIconRegistryProvider/VireoIconRegistryProvider";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { VireoLabeledIconButton } from "./VireoLabeledIconButton";
import { vireoLabeledIconButtonClasses } from "./VireoLabeledIconButton.classes";
import { VIREO_LABELED_ICON_BUTTON_NAME } from "./VireoLabeledIconButton.identity";

const renderButton = (node: React.ReactElement) =>
  render(<VireoIconRegistryProvider>{node}</VireoIconRegistryProvider>);

describe(VIREO_LABELED_ICON_BUTTON_NAME, () => {
  it("renders an accessible button with only its label", () => {
    renderButton(<VireoLabeledIconButton label="Dashboard" />);
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
  });
  it("renders a registered icon and calls its action", () => {
    const onClick = vi.fn();
    renderButton(<VireoLabeledIconButton label="Approve" icon="check-circle" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("exposes selected and disabled semantics", () => {
    renderButton(<VireoLabeledIconButton label="Alerts" selected disabled showStatusDot />);
    const button = screen.getByRole("button", { name: "Alerts" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
  it("forwards refs and applies slot classes", () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderButton(
      <VireoLabeledIconButton ref={ref} label="Settings" slotProps={{ label: { className: "custom-label" } }} />,
    );
    expect(ref.current).toBe(screen.getByRole("button"));
    expect(screen.getByText("Settings")).toHaveClass(vireoLabeledIconButtonClasses.label, "custom-label");
  });
  it("supports theme defaults and style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_LABELED_ICON_BUTTON_NAME]: {
          defaultProps: { selected: true },
          styleOverrides: { label: { fontWeight: 700 } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoIconRegistryProvider>
          <VireoLabeledIconButton label="Selected" />
        </VireoIconRegistryProvider>
      </ThemeProvider>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Selected")).toHaveStyle({ fontWeight: "700" });
  });

  it("derives its dimensions, shape, and label type from the consumer theme", () => {
    const theme = createTheme({
      shape: { borderRadius: 14 },
      spacing: 10,
      typography: {
        button: { textTransform: "uppercase" },
        caption: { fontSize: "13px", lineHeight: 1.6 },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoIconRegistryProvider>
          <VireoLabeledIconButton label="Notifications" showStatusDot />
        </VireoIconRegistryProvider>
      </ThemeProvider>,
    );

    expect(screen.getByRole("button")).toHaveStyle({
      borderRadius: "14px",
      gap: "5px",
      minWidth: "110px",
      textTransform: "uppercase",
    });
    expect(screen.getByText("Notifications")).toHaveStyle({ fontSize: "13px", lineHeight: "1.6" });
    expect(document.querySelector(`.${vireoLabeledIconButtonClasses.statusDot}`)).toHaveStyle({
      height: "20px",
      width: "20px",
    });
  });
});
