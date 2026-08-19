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
});
