import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { reviewers: 2 as number | null },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Review team" variant="plain" layout="stack">
          <form.Field name="reviewers">
            {field => (
              <VireoLabelBox label="Reviewers">
                <field.CounterField
                  aria-label="Reviewers"
                  decrementLabel="Remove one reviewer"
                  incrementLabel="Add one reviewer"
                  min={1}
                  max={6}
                  slots={{
                    decrementIcon: RemoveCircleOutlineIcon,
                    incrementIcon: AddCircleOutlineIcon,
                  }}
                  slotProps={{
                    root: ownerState => ({ "data-at-capacity": ownerState.atMax }),
                    decrementButton: ownerState => ({
                      color: ownerState.atMin ? "default" : "secondary",
                    }),
                    incrementButton: ownerState => ({
                      color: ownerState.atMax ? "default" : "secondary",
                    }),
                    htmlInput: { "data-analytics-field": "reviewer-count" },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
