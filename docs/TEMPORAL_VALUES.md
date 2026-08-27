# Temporal values

Vireo separates canonical values from localized presentation. Applications own
timezone conversion and domain meaning; UI fields do not silently attach the
browser's timezone to timezone-free business values.

## Canonical field values

| Mode         | Canonical example     | Meaning                                         |
| ------------ | --------------------- | ----------------------------------------------- |
| `year`       | `2026`                | Calendar year                                   |
| `month`      | `08`                  | Month independent of a year                     |
| `year-month` | `2026-08`             | Calendar month in a year                        |
| `date`       | `2026-08-25`          | Calendar date without a timezone                |
| `time`       | `14:30:00`            | Wall-clock time without a date or timezone      |
| `date-time`  | `2026-08-25T14:30:00` | Local calendar date and time without a timezone |

These six examples are exercised by the `VireoFormTemporalField` test suite. Minute
precision still serializes `:00` seconds so canonical shapes remain stable.

Use `VireoTemporalLocalizationProvider` for locale-aware field presentation:

```tsx
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoTemporalLocalizationProvider } from "@vireocodedev/ui/localization";

function SchedulingForm() {
  const form = useVireoForm({
    defaultValues: { startsAt: "2026-08-25T14:30:00" },
    onSubmit: ({ value }) => saveSchedule(value),
  });

  return (
    <VireoTemporalLocalizationProvider locale="en">
      <form.Form>
        <form.Field name="startsAt">{field => <field.TemporalField mode="date-time" precision="minute" />}</form.Field>
      </form.Form>
    </VireoTemporalLocalizationProvider>
  );
}
```

The provider controls picker locale and formatting. The submitted value remains the
canonical timezone-free string shown above.

## Instants and audit timestamps

An event instant is different from a form-local date-time. Send instants as ISO 8601
with `Z` or an explicit offset, for example `2026-08-25T12:30:00Z` or
`2026-08-25T14:30:00+02:00`. `@vireocodedev/history` accepts finite epoch numbers or
offset-bearing ISO date-times by default.

Do not convert a timezone-free `date-time` to an instant until application policy
selects the relevant timezone and resolves daylight-saving overlaps or gaps. Keep
that decision in the domain/API boundary, not inside a reusable field component.
