import { Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";
import { z } from "zod";

const seatsSchema = z
  .number()
  .int("Choose a whole number of seats.")
  .min(1, "Choose at least one seat.")
  .max(12, "Choose no more than 12 seats.")
  .nullable()
  .refine(value => value !== null, "Choose at least one seat.");

export default function ZodFieldValidationExample() {
  const [savedSeats, setSavedSeats] = React.useState<number | null>();
  const form = useVireoForm({
    defaultValues: { seats: null as number | null },
    onSubmit: ({ value }) => setSavedSeats(value.seats),
    validationLogic: revalidateLogic(),
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Reservation" variant="plain" layout="stack">
          <form.Field name="seats" validators={{ onDynamic: seatsSchema }}>
            {field => (
              <VireoLabelBox label="Seats" required>
                <field.CounterField aria-label="Seats" min={1} max={12} required />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.SubmitButton variant="contained">Reserve seats</form.SubmitButton>
          </form.Actions>
          {savedSeats !== undefined && <Typography color="success.main">Reserved {savedSeats} seats</Typography>}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
