import { Button, ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoSnack } from "./VireoSnack";
import { vireoSnackClasses } from "./VireoSnack.classes";
import { VIREO_SNACK_NAME } from "./VireoSnack.identity";

describe(VIREO_SNACK_NAME, () => {
  it("renders its message as a polite status by default", () => {
    render(<VireoSnack message="Saved" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("uses assertive alert semantics for errors and renders adornments", () => {
    render(
      <VireoSnack variant="error" message="Save failed" startAdornment="!" endAdornment={<Button>Retry</Button>} />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("!Save failedRetry");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("forwards root refs and composes slot classes", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <VireoSnack
        ref={ref}
        message="Saved"
        className="direct"
        slotProps={{ root: { className: "slot", "data-origin": "slot" }, message: { className: "message-slot" } }}
      />,
    );
    expect(ref.current).toBe(screen.getByRole("status"));
    expect(ref.current).toHaveClass(vireoSnackClasses.root, "direct", "slot");
    expect(ref.current).toHaveAttribute("data-origin", "slot");
    expect(screen.getByText("Saved")).toHaveClass(vireoSnackClasses.message, "message-slot");
  });

  it("passes normalized owner state to slot callbacks", () => {
    render(
      <VireoSnack
        variant="warning"
        message="Review"
        slotProps={{
          root: state => ({ "data-variant": state.variant }),
          message: state => ({ "data-has-end": String(state.hasEndAdornment) }),
        }}
      />,
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-variant", "warning");
    expect(screen.getByText("Review")).toHaveAttribute("data-has-end", "false");
  });

  it("supports theme defaults and slot overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_SNACK_NAME]: { defaultProps: { variant: "info" }, styleOverrides: { message: { fontWeight: 700 } } },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <VireoSnack message="Updated" />
      </ThemeProvider>,
    );
    expect(screen.getByText("Updated")).toHaveStyle({ fontWeight: "700" });
  });
});
