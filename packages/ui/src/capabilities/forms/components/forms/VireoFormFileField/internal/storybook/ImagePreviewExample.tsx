import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { VireoFileImagePreview, useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const initialImage = new File(
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="420"><rect width="960" height="420" fill="#172554"/><circle cx="480" cy="190" r="120" fill="#38bdf8"/><path d="M210 380 390 230l110 100 110-90 150 140Z" fill="#a7f3d0"/></svg>`,
  ],
  "product-cover.svg",
  { type: "image/svg+xml" },
);

export default function ImagePreviewExample() {
  const form = useVireoForm({ defaultValues: { cover: initialImage as File | null } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Product cover" variant="plain" layout="stack">
          <form.Field name="cover">
            {field => (
              <VireoLabelBox label="Cover image">
                <field.FileField
                  accept="image/*"
                  previewRenderer={VireoFileImagePreview}
                  slotProps={{ input: { "aria-label": "Cover image" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
