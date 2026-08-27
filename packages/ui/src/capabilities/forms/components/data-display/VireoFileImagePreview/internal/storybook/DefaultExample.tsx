import { VireoFileImagePreview } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const imageFile = new File(
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="480" viewBox="0 0 960 480">
      <rect width="960" height="480" fill="#111827"/>
      <circle cx="480" cy="210" r="110" fill="#38bdf8"/>
      <path d="M300 390 430 250l90 90 70-70 110 120Z" fill="#a7f3d0"/>
    </svg>`,
  ],
  "product-landscape.svg",
  { type: "image/svg+xml" },
);

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFileImagePreview file={imageFile} alt="Abstract product landscape" sx={{ maxWidth: 640 }} />
    </VireoStorybookProvider>
  );
}
