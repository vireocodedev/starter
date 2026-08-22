import { VireoPage, VireoPageBody } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper, Typography } from "@mui/material";
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoPage mode="regular" sx={{ border: 1, borderColor: "divider", height: 320 }}>
        <VireoPageBody
          maxWidth="md"
          drawer={
            <Paper square sx={{ height: "100%", p: 2, width: 180 }}>
              <Typography>Inspector</Typography>
            </Paper>
          }
        >
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6">Scrollable page content</Typography>
            <Typography color="text.secondary">
              The body owns content padding, scrolling, max width, and an optional sibling drawer.
            </Typography>
          </Paper>
        </VireoPageBody>
      </VireoPage>
    </VireoStorybookProvider>
  );
}
