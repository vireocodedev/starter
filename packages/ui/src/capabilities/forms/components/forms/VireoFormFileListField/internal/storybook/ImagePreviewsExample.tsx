import { VireoLabelBox } from "@vireocodedev/ui";
import { VireoFileImagePreview, useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

function image(name: string, background: string, foreground: string): File {
  return new File(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="320"><rect width="960" height="320" fill="${background}"/><circle cx="480" cy="140" r="90" fill="${foreground}"/><path d="M250 290 400 180l100 80 100-75 120 105Z" fill="#a7f3d0"/></svg>`,
    ],
    name,
    { type: "image/svg+xml" },
  );
}

const images = [image("cover.svg", "#172554", "#38bdf8"), image("back-cover.svg", "#3b0764", "#c084fc")];

export default function ImagePreviewsExample() {
  const form = useVireoForm({ defaultValues: { gallery: images } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Gallery" variant="plain" layout="stack">
          <form.Field name="gallery">
            {field => (
              <VireoLabelBox label="Images">
                <field.FileListField
                  accept="image/*"
                  previewRenderer={VireoFileImagePreview}
                  slotProps={{ input: { "aria-label": "Gallery images" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
