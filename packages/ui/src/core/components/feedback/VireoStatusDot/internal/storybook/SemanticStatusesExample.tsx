import { Stack, Typography } from "@mui/material";
import { VireoStatusDot, type VireoStatusDotColor } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const statuses: Array<{ color: VireoStatusDotColor; label: string }> = [
  { color: "success", label: "Operational" },
  { color: "warning", label: "Needs review" },
  { color: "error", label: "Unavailable" },
  { color: "info", label: "In progress" },
  { color: "standard", label: "Not started" },
];

export default function SemanticStatusesExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={1.5}>
        {statuses.map(status => (
          <Stack
            key={status.color}
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <VireoStatusDot color={status.color} />
            <Typography>{status.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
