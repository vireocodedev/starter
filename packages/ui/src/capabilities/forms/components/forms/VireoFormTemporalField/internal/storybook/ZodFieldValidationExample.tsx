import { Typography } from "@mui/material";
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
const schemas = {
  year: requiredCanonical(/^\d{4}$/, "Choose a year."),
  month: requiredCanonical(/^(0[1-9]|1[0-2])$/, "Choose a month."),
  yearMonth: requiredCanonical(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a year and month."),
  date: requiredCanonical(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  time: requiredCanonical(/^\d{2}:\d{2}:\d{2}$/, "Choose a time."),
  dateTime: requiredCanonical(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "Choose a date and time."),
};

export default function ZodFieldValidationExample() {
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
  });
  const fields = [
    ["year", "Year", "year", schemas.year],
    ["month", "Month", "month", schemas.month],
    ["yearMonth", "Year and month", "year-month", schemas.yearMonth],
    ["date", "Date", "date", schemas.date],
    ["time", "Time", "time", schemas.time],
    ["dateTime", "Date and time", "date-time", schemas.dateTime],
  ] as const;

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Schedule" variant="plain" maxColumns={2}>
          {fields.map(([name, label, mode, schema]) => (
            <form.Field key={name} name={name} validators={{ onDynamic: schema }}>
              {field => (
                <VireoLabelBox label={label} required>
                  <field.TemporalField mode={mode} required slotProps={{ htmlInput: { "aria-label": label } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          ))}
          <form.SectionItem span="full">
            <form.Actions>
              <form.SubmitButton variant="contained">Save schedule</form.SubmitButton>
            </form.Actions>
          </form.SectionItem>
          {saved && (
            <form.SectionItem span="full">
              <Typography color="success.main">Saved all six canonical temporal values.</Typography>
            </form.SectionItem>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
