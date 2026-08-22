import { VireoPage, VireoPageHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { ArrowBack, MoreVert } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoPage mode="regular" sx={{ border: 1, borderColor: "divider" }}>
        <VireoPageHeader
          leading={
            <IconButton aria-label="Back">
              <ArrowBack />
            </IconButton>
          }
          title="Customer details"
          actions={
            <>
              <Button>Edit</Button>
              <IconButton aria-label="More actions">
                <MoreVert />
              </IconButton>
            </>
          }
        />
      </VireoPage>
    </VireoStorybookProvider>
  );
}
