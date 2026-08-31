import { VireoOverlayHeader } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box, Stack, Typography } from "@mui/material";

const examples = [
  { label: "Sticky", sticky: true, regionLabel: "Sticky header example" },
  { label: "Non-sticky", sticky: false, regionLabel: "Non-sticky header example" },
] as const;

export default function StickyBehaviorExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {examples.map(example => (
          <Box key={example.label} sx={{ flex: 1, minWidth: 0 }}>
            <Typography color="text.secondary" variant="caption">
              {example.label}
            </Typography>
            <Box
              role="region"
              aria-label={example.regionLabel}
              tabIndex={0}
              sx={{
                height: 180,
                mt: 0.5,
                overflowY: "auto",
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <VireoOverlayHeader slots={{ root: "div" }} title={`${example.label} header`} sticky={example.sticky} />
              <Box sx={{ minHeight: 360, p: 3, color: "text.secondary" }}>
                Scrollable overlay content makes the positioning difference visible.
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
