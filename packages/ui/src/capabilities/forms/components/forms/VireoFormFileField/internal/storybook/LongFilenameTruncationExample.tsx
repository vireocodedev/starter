import { Box } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const longFile = new File(
  ["example"],
  "international-customer-research-and-quarterly-recommendations-final-reviewed.pdf",
  { type: "application/pdf" },
);

export default function LongFilenameTruncationExample() {
  const form = useVireoForm({ defaultValues: { report: longFile as File | null } });

  return (
    <VireoStorybookProvider>
      <Box sx={{ maxWidth: 460 }}>
        <form.Form>
          <form.Section label="Constrained container" variant="plain" layout="stack">
            <form.Field name="report">
              {field => (
                <VireoLabelBox label="Research report">
                  <field.FileField slotProps={{ input: { "aria-label": "Research report" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Form>
      </Box>
    </VireoStorybookProvider>
  );
}
