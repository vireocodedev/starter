import { VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Box, OutlinedInput, Paper, Stack, Typography } from "@mui/material";

const examples = [
  { label: "Wide container", width: 640 },
  { label: "Compact container", width: 360 },
] as const;

export default function ContainerResponsiveLayoutExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2}>
        {examples.map(example => (
          <Box
            key={example.label}
            sx={{
              maxWidth: "100%",
              width: example.width,
            }}
          >
            <Typography color="text.secondary" variant="caption">
              {example.label} · {example.width}px
            </Typography>
            <Paper variant="outlined" sx={{ mt: 0.5, p: 2 }}>
              <VireoLabelBox label="Workspace name" helperText="Shown to every member">
                {({ controlProps }) => (
                  <OutlinedInput {...controlProps} defaultValue="Northstar" size="small" fullWidth />
                )}
              </VireoLabelBox>
            </Paper>
          </Box>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
