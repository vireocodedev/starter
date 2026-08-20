import { useVireoForm } from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import {
  formatTemporalValue,
  parseTemporalValue,
} from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/temporalValue";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { vireoFormTemporalFieldClasses } from "./VireoFormTemporalField.classes";
import { VIREO_FORM_TEMPORAL_FIELD_NAME } from "./VireoFormTemporalField.identity";
import type { VireoFormTemporalFieldMode, VireoFormTemporalFieldProps } from "./VireoFormTemporalField.types";

type HarnessProps = {
  defaultValue?: string | null;
  fieldProps?: Partial<VireoFormTemporalFieldProps>;
  mode?: VireoFormTemporalFieldMode;
  onSubmit?: (value: string | null) => void;
  rootRef?: React.Ref<HTMLDivElement>;
};

function Harness({ defaultValue = null, fieldProps, mode = "date", onSubmit, rootRef }: HarnessProps) {
  const form = useVireoForm({
    defaultValues: { value: defaultValue },
    onSubmit: ({ value }) => onSubmit?.(value.value),
  });
  const temporalFieldProps = {
    ...fieldProps,
    mode,
    slotProps: { htmlInput: { "aria-label": "Temporal value" }, ...fieldProps?.slotProps },
  } as VireoFormTemporalFieldProps;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form.Form>
        <form.Field name="value">{field => <field.TemporalField {...temporalFieldProps} ref={rootRef} />}</form.Field>
        <button type="submit">Submit</button>
      </form.Form>
    </LocalizationProvider>
  );
}

describe(VIREO_FORM_TEMPORAL_FIELD_NAME, () => {
  it("renders its essential bound date semantics with only the required mode", () => {
    render(<Harness />);
    expect(screen.getByLabelText("Temporal value")).toBeInTheDocument();
  });

  it.each([
    ["year", "2026"],
    ["month", "08"],
    ["year-month", "2026-08"],
    ["date", "2026-08-25"],
    ["time", "14:30:00"],
    ["date-time", "2026-08-25T14:30:00"],
  ] as const)("renders the %s mode from its canonical value", (mode, defaultValue) => {
    render(<Harness mode={mode} defaultValue={defaultValue} />);
    expect((screen.getByLabelText("Temporal value") as HTMLInputElement).value).not.toBe("");
  });

  it("keeps the month picker year-independent", async () => {
    render(<Harness mode="month" defaultValue="08" />);
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    expect(await screen.findByText("August")).toBeInTheDocument();
    expect(screen.queryByText(/2000/)).not.toBeInTheDocument();
  });

  it("commits null through the clear action", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValue="2026-08-25" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByLabelText("Clear temporal value"));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(null));
  });

  it("blocks submission when a canonical value is incompatible with minute precision", async () => {
    const onSubmit = vi.fn();
    render(<Harness mode="time" defaultValue="14:30:15" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByLabelText("Temporal value")).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText("Seconds must be 00 when minute precision is used.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("preserves timezone-free clock values that may be local DST gaps", () => {
    const value = "2026-03-29T02:30:00";
    const parsed = parseTemporalValue("date-time", value);
    expect(parsed).not.toBeNull();
    expect(formatTemporalValue("date-time", parsed!)).toBe(value);
  });

  it("forwards the root ref and composes public utility classes", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    render(<Harness rootRef={rootRef} fieldProps={{ classes: { root: "custom-root" } }} />);
    expect(rootRef.current).toHaveClass(vireoFormTemporalFieldClasses.root, "custom-root");
  });

  it("supports owner-state slot props", () => {
    render(<Harness fieldProps={{ slotProps: { root: ownerState => ({ "data-mode": ownerState.mode }) } }} />);
    expect(screen.getByLabelText("Temporal value").closest(`.${vireoFormTemporalFieldClasses.root}`)).toHaveAttribute(
      "data-mode",
      "date",
    );
  });

  it("uses theme defaults and per-slot style overrides", () => {
    const theme = createTheme({
      components: {
        VireoFormTemporalField: {
          defaultProps: { className: "theme-default", mode: "date" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });
    render(
      <ThemeProvider theme={theme}>
        <Harness />
      </ThemeProvider>,
    );
    const root = screen.getByLabelText("Temporal value").closest(`.${vireoFormTemporalFieldClasses.root}`);
    expect(root).toHaveClass("theme-default");
    expect(root).toHaveStyle({ color: "rgb(123, 45, 67)" });
  });
});
