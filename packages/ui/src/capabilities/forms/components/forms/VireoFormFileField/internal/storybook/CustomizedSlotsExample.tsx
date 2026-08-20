import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Paper } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const initialFile = new File(["release notes"], "release-notes.md", { type: "text/markdown" });

export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { releaseNotes: initialFile as File | null } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Release notes" variant="plain" layout="stack">
          <form.Field name="releaseNotes">
            {field => (
              <VireoLabelBox label="Notes file">
                <field.FileField
                  slots={{ root: Paper }}
                  slotProps={{
                    root: ownerState => ({
                      "data-populated": ownerState.populated,
                      elevation: 0,
                      sx: { borderStyle: "dashed", borderColor: ownerState.populated ? "success.main" : "divider" },
                    }),
                    input: { "aria-label": "Notes file" },
                    selectButton: { startIcon: <UploadFileIcon /> },
                    fileName: { color: "success.light", fontWeight: 600 },
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
