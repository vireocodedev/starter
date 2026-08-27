import { Alert } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm, type VireoFileListRejection } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import React from "react";

export default function PartialAcceptanceAndRejectionsExample() {
  const [lastBatch, setLastBatch] = React.useState<readonly VireoFileListRejection[]>([]);
  const form = useVireoForm({ defaultValues: { documents: [] as File[] } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Document requirements" variant="plain" layout="stack">
          <form.Field name="documents">
            {field => (
              <VireoLabelBox label="Documents">
                <field.FileListField
                  accept="application/pdf,.pdf"
                  maxFiles={3}
                  maxSize={500_000}
                  maxTotalSize={1_000_000}
                  onFilesRejected={setLastBatch}
                  helperText="PDF only; three files maximum; 500 kB each and 1 MB total. Valid files in a mixed batch remain accepted."
                  slotProps={{ input: { "aria-label": "Documents" } }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          {lastBatch.length > 0 && (
            <Alert severity="warning">The latest batch rejected {lastBatch.length} files.</Alert>
          )}
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
