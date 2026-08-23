import { VireoStorybookProvider } from "../storybook";
import { DateField } from "@mui/x-date-pickers/DateField";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("VireoStorybookProvider", () => {
  it("provides the MUI date-picker localization context", () => {
    render(
      <VireoStorybookProvider>
        <DateField label="Review date" value={null} />
      </VireoStorybookProvider>,
    );

    const field = screen.getByRole("group", { name: "Review date" });

    expect(within(field).getByRole("spinbutton", { name: "Month" })).toHaveTextContent("MM");
    expect(within(field).getByRole("spinbutton", { name: "Day" })).toHaveTextContent("DD");
    expect(within(field).getByRole("spinbutton", { name: "Year" })).toHaveTextContent("YYYY");
  });

  it("allows stories to select the temporal locale explicitly", () => {
    render(
      <VireoStorybookProvider temporalLocale="hr">
        <DateField label="Datum" value={null} />
      </VireoStorybookProvider>,
    );

    const field = screen.getByRole("group", { name: "Datum" });

    expect(within(field).getByRole("spinbutton", { name: "Dan" })).toHaveTextContent("DD");
    expect(within(field).getByRole("spinbutton", { name: "Mjesec" })).toHaveTextContent("MM");
    expect(within(field).getByRole("spinbutton", { name: "Godina" })).toHaveTextContent("GGGG");
  });
});
