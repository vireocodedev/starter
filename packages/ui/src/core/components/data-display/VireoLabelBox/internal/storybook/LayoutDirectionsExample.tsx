import { VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { OutlinedInput, Paper, Stack, Typography } from "@mui/material";

export default function LayoutDirectionsExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ display: "grid", gap: 1, p: 2 }}>
          <Typography color="text.secondary" variant="caption">
            Column
          </Typography>
          <VireoLabelBox label="Project code" helperText="Optional">
            {({ controlProps }) => <OutlinedInput {...controlProps} defaultValue="NORTHSTAR" size="small" fullWidth />}
          </VireoLabelBox>
        </Paper>

        <Paper variant="outlined" sx={{ display: "grid", gap: 1, p: 2 }}>
          <Typography color="text.secondary" variant="caption">
            Row
          </Typography>
          <VireoLabelBox label="Project code" helperText="Optional" direction="row">
            {({ controlProps }) => <OutlinedInput {...controlProps} defaultValue="NORTHSTAR" size="small" fullWidth />}
          </VireoLabelBox>
        </Paper>
      </Stack>
    </VireoStorybookProvider>
  );
}
