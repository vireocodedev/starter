import { VireoHistoryEntry, VireoLoadingRegion } from "@vireocodedev/ui";
import { createHistoryDefinition } from "@vireocodedev/history";
import { Box, Button } from "@mui/material";
import React from "react";
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

export default function AlignmentContractExample() {
  const [loading, setLoading] = React.useState(false);

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Button data-testid="toggle-history-entry-loading" onClick={() => setLoading(current => !current)}>
        Toggle loading
      </Button>
      <VireoLoadingRegion loading={loading} loadingLabel="Loading account history" sx={{ mt: 2 }}>
        {({ loadingVisible }) =>
          loading ? (
            <VireoHistoryEntry definition={accountHistoryDefinition} loading loadingVisible={loadingVisible} />
          ) : (
            <VireoHistoryEntry
              definition={accountHistoryDefinition}
              previous={{ id: "ACC-241", name: "Northstar", owner: "Maya Chen", status: "Trial" }}
              current={{ id: "ACC-241", name: "Northstar Labs", owner: "Maya Chen", status: "Active" }}
              rootMeta="Today at 14:32 · Niko Barić"
              showRootEntityLabel={false}
            />
          )
        }
      </VireoLoadingRegion>
    </Box>
  );
}
