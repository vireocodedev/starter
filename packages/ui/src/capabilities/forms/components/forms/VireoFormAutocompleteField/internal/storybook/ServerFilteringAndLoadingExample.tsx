import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const catalog = ["Amsterdam", "Athens", "Barcelona", "Berlin", "Zagreb"].map((name, id) => ({ id: String(id), name }));
export default function ServerFilteringAndLoadingExample() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState(catalog);
  const form = useVireoForm({ defaultValues: { cityId: null as string | null }, onSubmit: () => undefined });
  React.useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      setResults(catalog.filter(city => city.name.toLowerCase().includes(query.toLowerCase())));
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Remote city search" variant="plain" layout="stack">
          <form.Field name="cityId">
            {field => (
              <VireoLabelBox label="City">
                <field.AutocompleteField
                  label={null}
                  filterMode="server"
                  options={results}
                  loading={loading}
                  inputValue={query}
                  onInputValueChange={(value, reason) => reason === "input" && setQuery(value)}
                  getOptionValue={city => city.id}
                  getOptionLabel={city => city.name}
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
