import { Button, Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const selectedCustomer = { id: "cus-10482", name: "Northstar Analytics" };
const results = [
  { id: "cus-20417", name: "Harbor Systems" },
  { id: "cus-30991", name: "Juniper Labs" },
];
export default function AsyncSelectedOptionHydrationExample() {
  const [loaded, setLoaded] = React.useState(false);
  const form = useVireoForm({ defaultValues: { customerId: "cus-10482" as string | null }, onSubmit: () => undefined });
  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Async customer lookup" variant="plain" layout="stack">
          <Stack spacing={2}>
            <form.Field name="customerId">
              {field => (
                <VireoLabelBox label="Customer">
                  <field.AutocompleteField
                    label={null}
                    options={loaded ? [selectedCustomer, ...results] : results}
                    selectedOption={selectedCustomer}
                    getOptionValue={customer => customer.id}
                    getOptionLabel={customer => customer.name}
                    slotProps={{ htmlInput: { "aria-label": "Customer" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <Button onClick={() => setLoaded(value => !value)}>
              {loaded ? "Unload current result" : "Load current result"}
            </Button>
          </Stack>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
