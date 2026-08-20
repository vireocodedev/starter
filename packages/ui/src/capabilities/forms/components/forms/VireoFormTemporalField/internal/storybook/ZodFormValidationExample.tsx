import { Box, Stack, Typography } from "@mui/material";
import { revalidateLogic } from "@tanstack/react-form";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
import { z } from "zod";

const requiredCanonical = (pattern: RegExp, message: string) =>
  z
    .string()
    .regex(pattern, message)
    .nullable()
    .refine(value => value !== null, message);
const scheduleSchema = z.object({
  year: requiredCanonical(/^\d{4}$/, "Choose a year."),
  month: requiredCanonical(/^(0[1-9]|1[0-2])$/, "Choose a month."),
  yearMonth: requiredCanonical(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a year and month."),
  date: requiredCanonical(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  time: requiredCanonical(/^\d{2}:\d{2}:\d{2}$/, "Choose a time."),
  dateTime: requiredCanonical(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "Choose a date and time."),
});

export default function ZodFormValidationExample() {
  const [saved, setSaved] = React.useState(false);
  const form = useVireoForm({
    defaultValues: {
      year: null as string | null,
      month: null as string | null,
      yearMonth: null as string | null,
      date: null as string | null,
      time: null as string | null,
      dateTime: null as string | null,
    },
    onSubmit: () => setSaved(true),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: scheduleSchema },
  });
  const fields = [
    ["year", "Year", "year"],
    ["month", "Month", "month"],
    ["yearMonth", "Year and month", "year-month"],
    ["date", "Date", "date"],
    ["time", "Time", "time"],
    ["dateTime", "Date and time", "date-time"],
  ] as const;

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 760 }}>
        <Stack spacing={2}>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
            {fields.map(([name, label, mode]) => (
              <form.Field key={name} name={name}>
                {field => (
                  <VireoLabelBox label={label} required>
                    <field.TemporalField mode={mode} required slotProps={{ htmlInput: { "aria-label": label } }} />
                  </VireoLabelBox>
                )}
              </form.Field>
            ))}
          </Box>
          <form.SubmitButton variant="contained">Save schedule</form.SubmitButton>
          {saved && <Typography color="success.main">The complete schedule passed one Zod object schema.</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
