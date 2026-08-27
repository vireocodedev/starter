import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoTemporalLocalizationProvider } from "@vireocodedev/ui/localization";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function TemporalForm() {
  const form = useVireoForm({ defaultValues: { date: null as string | null }, onSubmit: () => undefined });
  return (
    <form.Form>
      <form.Field name="date">
        {field => <field.TemporalField mode="date" slotProps={{ htmlInput: { "aria-label": "Review date" } }} />}
      </form.Field>
    </form.Form>
  );
}

describe("temporal localization public contract", () => {
  it("provides the required Vireo scope to bound temporal fields", () => {
    render(
      <VireoTemporalLocalizationProvider locale="en">
        <TemporalForm />
      </VireoTemporalLocalizationProvider>,
    );

    const field = screen.getByRole("group", { name: "Review date" });

    expect(within(field).getByRole("spinbutton", { name: "Month" })).toHaveTextContent("MM");
    expect(within(field).getByRole("spinbutton", { name: "Day" })).toHaveTextContent("DD");
    expect(within(field).getByRole("spinbutton", { name: "Year" })).toHaveTextContent("YYYY");
  });
});
