import { Stack } from "@mui/material";
import { VireoIconRegistryProvider, VireoLabeledIconButton } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function SelectionAndStatusStatesExample() {
  return (
    <VireoStorybookProvider>
      <VireoIconRegistryProvider>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "flex-start",
          }}
        >
          <VireoLabeledIconButton label="Dashboard" icon="check-circle" selected />
          <VireoLabeledIconButton label="Updates" showStatusDot />
          <VireoLabeledIconButton label="Archived" icon="check-circle" disabled />
        </Stack>
      </VireoIconRegistryProvider>
    </VireoStorybookProvider>
  );
}
