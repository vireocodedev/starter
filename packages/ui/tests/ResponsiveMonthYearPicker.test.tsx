import { ResponsiveMonthYearPicker } from "@/components/ResponsiveMonthYearPicker";
import { fireEvent, render, screen, within } from "@testing-library/react";
import dayjs from "dayjs";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useResponsiveProps", () => ({
  useResponsiveProps: <M, D>(config: { mobile: M; desktop: D }) => config.mobile,
}));

vi.mock("@vireocodedev/starter-localization", () => ({
  usePlatformTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case "common.cancel":
          return "Cancel";
        case "common.done":
          return "Done";
        default:
          return key;
      }
    },
  }),
}));

describe("ResponsiveMonthYearPicker", () => {
  it("renders month and year as side-by-side mobile wheel columns", () => {
    const onChange = vi.fn();
    const value = dayjs("2025-03-01");
    const nextMonth = value.month(3).format("MMMM");

    render(
      <ResponsiveMonthYearPicker
        value={value}
        onChange={onChange}
        views={["month", "year"]}
        openTo="month"
        format="MMMM YYYY"
        monthLabel="Month"
        yearLabel="Year"
        maxDate={dayjs("2026-12-31")}
        textFieldProps={{ label: "Period" }}
      />,
    );

    fireEvent.click(screen.getByRole("textbox", { name: "Period" }));
    const monthWheel = screen.getByRole("listbox", { name: "Month" });
    const yearWheel = screen.getByRole("listbox", { name: "Year" });

    fireEvent.click(within(monthWheel).getByRole("option", { name: nextMonth }));
    fireEvent.click(within(yearWheel).getByRole("option", { name: "2026" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0].year()).toBe(2026);
    expect(onChange.mock.calls[0][0].month()).toBe(3);
  });

  it("renders only one wheel for a year-only picker", () => {
    render(
      <ResponsiveMonthYearPicker
        value={dayjs("2025-01-01")}
        onChange={vi.fn()}
        views={["year"]}
        openTo="year"
        format="YYYY"
        monthLabel="Month"
        yearLabel="Year"
        textFieldProps={{ label: "Year picker" }}
      />,
    );

    fireEvent.click(screen.getByRole("textbox", { name: "Year picker" }));

    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    expect(screen.getByRole("listbox", { name: "Year" })).toBeInTheDocument();
  });
});
