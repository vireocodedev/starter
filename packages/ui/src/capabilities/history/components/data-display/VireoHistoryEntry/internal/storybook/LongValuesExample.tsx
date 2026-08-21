import { VireoHistoryEntry } from "@vireocodedev/starter-ui";
import { createHistoryDefinitionBuilderFn } from "@vireocodedev/starter-history";
import { Box } from "@mui/material";
import { z } from "zod";

const NoteSchema = z.object({ id: z.string(), summary: z.string(), category: z.string() });
const buildNoteHistory = createHistoryDefinitionBuilderFn(NoteSchema);
const noteHistoryDefinition = buildNoteHistory(
  { label: "Case note", key: note => note.id, render: note => note.category },
  {
    id: false,
    category: { kind: "field", label: "Category" },
    summary: { kind: "field", label: "Summary" },
  },
);

const previousSummary =
  "The customer reported intermittent export failures while processing large monthly datasets. The support team reproduced the issue and requested diagnostic logs from the affected workspace.";
const currentSummary =
  "The customer reported intermittent export failures while processing large monthly datasets. Engineering identified an exhausted worker pool, deployed a configuration update, and confirmed that three consecutive exports completed successfully.";

export default function LongValuesExample() {
  return (
    <Box sx={{ maxWidth: 760 }}>
      <VireoHistoryEntry
        definition={noteHistoryDefinition}
        previous={{ id: "note-18", category: "Investigation", summary: previousSummary }}
        current={{ id: "note-18", category: "Resolved", summary: currentSummary }}
        rootMeta="Support case · CS-2841"
      />
    </Box>
  );
}
