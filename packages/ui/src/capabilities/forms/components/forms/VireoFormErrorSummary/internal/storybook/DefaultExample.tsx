import { Stack } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { z } from "zod";

export default function DefaultExample() {
  const form = useVireoForm({ defaultValues: { email: "", name: "" }, onSubmit: () => undefined });
  return (
    <form.Form sx={{ maxWidth: 560 }}>
      <Stack spacing={2}>
        <form.ErrorSummary scope="all" />
        <form.Field name="name" validators={{ onSubmit: z.string().min(1, "Enter a name.") }}>
          {field => (
            <VireoLabelBox label="Name" required>
              <field.TextField slotProps={{ htmlInput: { "aria-label": "Name" } }} />
            </VireoLabelBox>
          )}
        </form.Field>
        <form.Field name="email" validators={{ onSubmit: z.string().email("Enter a valid email.") }}>
          {field => (
            <VireoLabelBox label="Email" required>
              <field.TextField slotProps={{ htmlInput: { "aria-label": "Email" } }} />
            </VireoLabelBox>
          )}
        </form.Field>
        <form.SubmitButton>Save profile</form.SubmitButton>
      </Stack>
    </form.Form>
  );
}
