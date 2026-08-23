import { VireoTruncatedContent } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, Stack, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import React from "react";

export default function ClickableRecordRowExample() {
  const [rowActivations, setRowActivations] = React.useState(0);

  return (
    <VireoStorybookProvider>
      <Stack
        spacing={1.5}
        sx={{
          maxWidth: "100%",
          width: 560,
        }}
      >
        <Paper variant="outlined">
          <Table>
            <TableBody>
              <TableRow hover onClick={() => setRowActivations(count => count + 1)} sx={{ cursor: "pointer" }}>
                <TableCell>
                  <VireoTruncatedContent
                    collapsedHeight={48}
                    expandLabel="Show full note"
                    collapseLabel="Hide full note"
                    stopPropagation
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Quarterly account review
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      The rollout is approved. Confirm retention settings, administrator training, and the final
                      production-readiness review before enabling the workspace.
                    </Typography>
                  </VireoTruncatedContent>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
        <Typography color="text.secondary" variant="body2">
          Row activations: {rowActivations}
        </Typography>
      </Stack>
    </VireoStorybookProvider>
  );
}
