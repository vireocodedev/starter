import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const initialFiles = ["front.jpg", "back.jpg", "detail.jpg"].map(
  name => new File([name], name, { type: "image/jpeg" }),
);

export default function CapacityReachedExample() {
  const form = useVireoForm({ defaultValues: { photos: initialFiles } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Product photos" variant="plain" layout="stack">
          <form.Field name="photos">
            {field => (
              <VireoLabelBox label="Photos">
                <field.FileListField
                  accept="image/*"
                  maxFiles={3}
                  helperText="Remove one photo to restore the file chooser."
                  slotProps={{ input: { "aria-label": "Product photos" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
