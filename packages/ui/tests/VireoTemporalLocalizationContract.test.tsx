import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoTemporalLocalizationProvider } from "@vireocodedev/starter-ui/localization";
import { render, screen } from "@testing-library/react";
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

    expect(screen.getByRole("textbox", { name: "Review date" })).toHaveAttribute("placeholder", "MM/DD/YYYY");
  });
});
