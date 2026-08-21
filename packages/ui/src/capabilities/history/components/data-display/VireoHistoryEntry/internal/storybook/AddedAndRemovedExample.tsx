import { VireoHistoryEntry } from "@vireocodedev/starter-ui";
import { createHistoryDefinitionBuilderFn } from "@vireocodedev/starter-history";
import { Box, Stack, Typography } from "@mui/material";
import { z } from "zod";

const MemberSchema = z.object({ id: z.string(), name: z.string(), role: z.string() });
const buildMemberHistory = createHistoryDefinitionBuilderFn(MemberSchema);
const memberHistoryDefinition = buildMemberHistory(
  { label: "Member", key: member => member.id, render: member => member.name },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    role: { kind: "field", label: "Role" },
  },
);

export default function AddedAndRemovedExample() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
          Added
        </Typography>
        <VireoHistoryEntry
          definition={memberHistoryDefinition}
          previous={null}
          current={{ id: "member-7", name: "Sora Tanaka", role: "Operations" }}
          rootMeta="Invitation accepted"
          showRootEntityLabel
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
          Removed
        </Typography>
        <VireoHistoryEntry
          definition={memberHistoryDefinition}
          previous={{ id: "member-3", name: "Niko Barić", role: "Designer" }}
          current={null}
          rootMeta="Access revoked"
          showRootEntityLabel
        />
      </Box>
    </Stack>
  );
}
