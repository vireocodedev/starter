import { VireoHistoryEntry } from "@vireocodedev/starter-ui";
import { createHistoryDefinition } from "@vireocodedev/starter-history";
import { Box, Typography } from "@mui/material";
import { z } from "zod";

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  owner: z.string(),
});

const customerHistoryDefinition = createHistoryDefinition(
  CustomerSchema,
  { label: "Customer", key: customer => customer.id, format: customer => customer.name },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    status: { kind: "field", label: "Status" },
    owner: { kind: "field", label: "Owner" },
  },
);

export default function DefaultExample() {
  return (
    <Box sx={{ maxWidth: 760 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Customer profile update
      </Typography>
      <VireoHistoryEntry
        aria-label="Customer change history"
        definition={customerHistoryDefinition}
        previous={{ id: "CUS-10482", name: "Northstar Labs", status: "Prospect", owner: "Maya Chen" }}
        current={{ id: "CUS-10482", name: "Northstar Analytics", status: "Active", owner: "Maya Chen" }}
        rootMeta="Today at 14:32 · Niko Barić"
        showRootEntityLabel
      />
    </Box>
  );
}
