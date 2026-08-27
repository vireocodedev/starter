import { VireoHistoryEntry } from "@vireocodedev/ui";
import { createHistoryDefinition } from "@vireocodedev/history";
import { Box } from "@mui/material";
import { z } from "zod";

const AccountSchema = z.object({ id: z.string(), name: z.string(), owner: z.string(), status: z.string() });
const accountHistoryDefinition = createHistoryDefinition(
  AccountSchema,
  { label: "Account", key: account => account.id, format: account => account.name },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    owner: false,
    status: { kind: "field", label: "Status" },
  },
);

export default function LoadedExample() {
  return (
    <Box sx={{ maxWidth: 760 }}>
      <VireoHistoryEntry
        aria-label="Account change history"
        definition={accountHistoryDefinition}
        previous={{ id: "ACC-241", name: "Northstar", owner: "Maya Chen", status: "Trial" }}
        current={{ id: "ACC-241", name: "Northstar Labs", owner: "Maya Chen", status: "Active" }}
        rootMeta="Today at 14:32 · Niko Barić"
      />
    </Box>
  );
}
