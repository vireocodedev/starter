import { Typography } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [savedSeats, setSavedSeats] = React.useState<number>();
  const form = useVireoForm({
    defaultValues: { seats: 2 as number | null },
    onSubmit: ({ value }) => setSavedSeats(value.seats ?? 0),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Capacity" variant="plain" layout="stack">
          <form.Field name="seats">
            {field => (
              <VireoLabelBox label="Seats">
                <field.CounterField aria-label="Seats" min={0} max={10} />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Save capacity</form.SubmitButton>
            <form.ResetButton>Reset</form.ResetButton>
          </form.Actions>
          {savedSeats !== undefined && <Typography color="success.main">Saved {savedSeats} seats</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
