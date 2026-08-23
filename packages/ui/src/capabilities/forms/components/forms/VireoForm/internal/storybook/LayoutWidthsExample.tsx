import { Box, Stack, Typography } from "@mui/material";
import { useVireoForm, type VireoFormLayoutWidth } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function WidthExample({ layoutWidth }: { layoutWidth: VireoFormLayoutWidth }) {
  const form = useVireoForm({ defaultValues: {} });

  return (
    <Box sx={{ border: 1, borderColor: "divider", p: 2 }}>
      <form.Form layoutWidth={layoutWidth}>
        <Typography
          sx={{
            fontWeight: 700,
          }}
        >
          {layoutWidth}
        </Typography>
        <Typography color="text.secondary">The form owns this content-width constraint.</Typography>
      </form.Form>
    </Box>
  );
}

export default function LayoutWidthsExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2}>
        <WidthExample layoutWidth="standard" />
        <WidthExample layoutWidth="wide" />
        <WidthExample layoutWidth="full" />
      </Stack>
    </VireoStorybookProvider>
  );
}
