import { VireoHistoryEntry, VireoLoadingRegion } from "@vireocodedev/ui";
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

export default function LoadingExample() {
  return (
    <Box sx={{ maxWidth: 760 }}>
      <VireoLoadingRegion loading loadingLabel="Loading account history">
        {({ loadingVisible }) => (
          <VireoHistoryEntry definition={accountHistoryDefinition} loading loadingVisible={loadingVisible} />
        )}
      </VireoLoadingRegion>
    </Box>
  );
}
