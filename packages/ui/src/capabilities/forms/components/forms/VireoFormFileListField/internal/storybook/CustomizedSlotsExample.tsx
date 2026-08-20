import AttachFileIcon from "@mui/icons-material/AttachFile";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Paper } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const initialFiles = [
  new File(["release notes"], "release-notes.md", { type: "text/markdown" }),
  new File(["migration guide"], "migration-guide.pdf", { type: "application/pdf" }),
];

export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { documents: initialFiles } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Release documents" variant="plain" layout="stack">
          <form.Field name="documents">
            {field => (
              <VireoLabelBox label="Documents">
                <field.FileListField
                  reorderable
                  slots={{ root: Paper }}
                  slotProps={{
                    root: ownerState => ({
                      "data-file-count": ownerState.fileCount,
                      elevation: 0,
                      sx: { borderStyle: "dashed", borderColor: ownerState.populated ? "success.main" : "divider" },
                    }),
                    input: { "aria-label": "Release documents" },
                    selectButton: { startIcon: <AttachFileIcon /> },
                    reorderHandle: { children: <DragIndicatorIcon fontSize="small" />, color: "success" },
                    fileName: ownerState => ({ color: ownerState.first ? "success.light" : "text.primary" }),
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
