import { Button, Stack, TextField, Typography } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

export default function DefaultExample() {
  const [submittedEmail, setSubmittedEmail] = React.useState<string>();
  const form = useVireoForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => setSubmittedEmail(value.email),
  });

  return (
    <VireoStorybookProvider>
      <form.Form sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <form.Field
            name="email"
            validators={{
              onSubmit: ({ value }) => (value.includes("@") ? undefined : "Enter a valid email address."),
            }}
          >
            {field => (
              <TextField
                fullWidth
                label="Email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={event => field.handleChange(event.target.value)}
                error={!field.state.meta.isValid}
                helperText={field.state.meta.errors[0]?.toString()}
                inputProps={{ "aria-invalid": !field.state.meta.isValid }}
              />
            )}
          </form.Field>
          <Button type="submit" variant="contained">
            Save profile
          </Button>
          {submittedEmail && <Typography>Saved {submittedEmail}</Typography>}
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
