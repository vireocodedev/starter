import { Paper, Stack, Typography } from "@mui/material";
import { VireoStatusDot } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function StandaloneAccessibleStatusExample() {
  return (
    <VireoStorybookProvider>
      <Paper variant="outlined" sx={{ maxWidth: 360, p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack>
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              Payments API
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compact monitoring card
            </Typography>
          </Stack>
          <VireoStatusDot color="error" label="Payments API unavailable" size={12} />
        </Stack>
      </Paper>
    </VireoStorybookProvider>
  );
}
