import { VireoStopwatch } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoStopwatch
        startDate={Date.UTC(2026, 0, 1, 9, 0, 0)}
        endDate={Date.UTC(2026, 0, 1, 11, 2, 3)}
        label="Build duration"
        slots={{ root: "output" }}
        slotProps={{
          root: ownerState => ({
            "data-running": ownerState.running,
            sx: {
              border: 1,
              borderColor: "info.main",
              borderRadius: 1,
              color: "info.light",
              px: 1.5,
              py: 1,
            },
          }),
        }}
      />
    </VireoStorybookProvider>
  );
}
