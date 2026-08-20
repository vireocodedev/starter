import { Alert, Typography } from "@mui/material";
import { VireoFormSection, VireoFormSectionItem } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Account review" maxColumns={2}>
        <Typography>Identity checks</Typography>
        <Typography>Billing checks</Typography>
        <VireoFormSectionItem
          span="full"
          slots={{ root: "aside" }}
          slotProps={{
            root: ownerState => ({
              "aria-label": "Review guidance",
              "data-span": ownerState.span,
              sx: { borderInlineStart: 3, borderColor: "primary.main", pl: 2 },
            }),
          }}
        >
          <Alert severity="warning">Resolve all checks before activating the account.</Alert>
        </VireoFormSectionItem>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
