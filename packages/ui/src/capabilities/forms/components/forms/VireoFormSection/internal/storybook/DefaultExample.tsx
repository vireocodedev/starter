import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Stack, TextField } from "@mui/material";
import { VireoFormSection } from "@vireocodedev/starter-ui";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormSection label="Billing details">
        <Stack spacing={2}>
          <TextField label="Company name" />
          <TextField label="Tax ID" />
        </Stack>
      </VireoFormSection>
    </VireoStorybookProvider>
  );
}
