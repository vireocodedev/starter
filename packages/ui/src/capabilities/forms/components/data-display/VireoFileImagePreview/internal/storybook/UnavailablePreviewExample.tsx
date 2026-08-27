import { VireoFileImagePreview } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

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
