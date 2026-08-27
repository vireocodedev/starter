import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

const catalog = ["Amsterdam", "Athens", "Barcelona", "Berlin", "Zagreb"];
export default function LoadingExample() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState(catalog);
  const form = useVireoForm({ defaultValues: { city: null as string | null }, onSubmit: () => undefined });
  React.useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      setResults(catalog.filter(city => city.toLowerCase().includes(query.toLowerCase())));
      setLoading(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Remote city search" variant="plain" layout="stack">
          <form.Field name="city">
            {field => (
              <VireoLabelBox label="City">
                <field.FreeSoloAutocompleteField
                  label={null}
                  filterMode="server"
                  options={results}
                  loading={loading}
                  inputValue={query}
                  onInputValueChange={(value, reason) => reason === "input" && setQuery(value)}
                  getOptionValue={city => city}
                  getOptionLabel={city => city}
                  slotProps={{ htmlInput: { "aria-label": "City" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
