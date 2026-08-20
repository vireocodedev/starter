import { VireoFileImagePreview } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const documentFile = new File(["Quarterly report"], "quarterly-report.pdf", { type: "application/pdf" });

export default function UnavailablePreviewExample() {
  return (
    <VireoStorybookProvider>
      <VireoFileImagePreview
        file={documentFile}
        previewUnavailableText="This file does not have an image preview."
        sx={{ maxWidth: 560 }}
      />
    </VireoStorybookProvider>
  );
}
