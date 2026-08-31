import { Box, Stack, TextField, Typography } from "@mui/material";
import { VireoFormSection, VireoLabelBox } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const fields = ["First name", "Last name", "Company"];

function SectionAtWidth({ label, width }: { label: string; width: number }) {
  return (
    <Box sx={{ maxWidth: width, width: "100%" }}>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <VireoFormSection label={`${label} customer`} maxColumns={3}>
        {fields.map(field => (
          <VireoLabelBox key={field} label={field}>
            <TextField fullWidth slotProps={{ htmlInput: { "aria-label": field } }} />
          </VireoLabelBox>
        ))}
      </VireoFormSection>
    </Box>
  );
}

export default function ContainerResponsiveColumnsExample() {
  return (
    <VireoStorybookProvider>
      <Stack
        spacing={3}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <SectionAtWidth label="Wide container: three columns" width={1040} />
        <SectionAtWidth label="Compact container: one column" width={420} />
      </Stack>
    </VireoStorybookProvider>
  );
}
