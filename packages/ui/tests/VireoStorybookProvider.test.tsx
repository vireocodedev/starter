import { VireoStorybookProvider } from "../storybook";
import { DateField } from "@mui/x-date-pickers/DateField";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("VireoStorybookProvider", () => {
  it("provides the MUI date-picker localization context", () => {
    render(
      <VireoStorybookProvider>
        <DateField label="Review date" value={null} />
      </VireoStorybookProvider>,
    );

    expect(screen.getByRole("textbox", { name: "Review date" })).toHaveAttribute("placeholder", "MM/DD/YYYY");
  });

  it("allows stories to select the temporal locale explicitly", () => {
    render(
      <VireoStorybookProvider temporalLocale="hr">
        <DateField label="Datum" value={null} />
      </VireoStorybookProvider>,
    );

    expect(screen.getByRole("textbox", { name: "Datum" })).toHaveAttribute("placeholder", "DD.MM.GGGG");
  });
});
