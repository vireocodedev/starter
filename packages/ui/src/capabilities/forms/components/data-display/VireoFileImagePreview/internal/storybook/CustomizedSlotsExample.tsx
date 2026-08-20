import { Box } from "@mui/material";
import { VireoFileImagePreview } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const imageFile = new File(
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420"><rect width="720" height="420" fill="#172554"/><circle cx="360" cy="210" r="130" fill="#fb7185"/></svg>`,
  ],
  "campaign-art.svg",
  { type: "image/svg+xml" },
);

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoFileImagePreview
        file={imageFile}
        alt="Campaign artwork"
        objectFit="cover"
        slots={{ root: Box }}
        slotProps={{
          root: {
            sx: { border: "2px dashed", borderColor: "primary.main", borderRadius: 3, maxWidth: 560, p: 1 },
          },
          image: ownerState => ({ "data-fit": ownerState.objectFit, sx: { borderRadius: 2 } }),
        }}
      />
    </VireoStorybookProvider>
  );
}
