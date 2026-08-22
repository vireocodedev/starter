import { Box } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const files = [
  new File(["short"], "summary.pdf", { type: "application/pdf" }),
  new File(["long"], "international-customer-research-and-quarterly-recommendations-final-reviewed.pdf", {
    type: "application/pdf",
  }),
];

export default function LongFilenameTruncationExample() {
  const form = useVireoForm({ defaultValues: { reports: files } });

  return (
    <VireoStorybookProvider>
      <Box sx={{ maxWidth: 480 }}>
        <form.Form>
          <form.Section label="Constrained container" variant="plain" layout="stack">
            <form.Field name="reports">
              {field => (
                <VireoLabelBox label="Research reports">
                  <field.FileListField slotProps={{ input: { "aria-label": "Research reports" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Form>
      </Box>
    </VireoStorybookProvider>
  );
}
