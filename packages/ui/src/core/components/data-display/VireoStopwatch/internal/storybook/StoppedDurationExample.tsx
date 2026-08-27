import { VireoStopwatch } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function StoppedDurationExample() {
  return (
    <VireoStorybookProvider>
      <VireoStopwatch
        startDate={Date.UTC(2026, 0, 1, 9, 0, 0)}
        endDate={Date.UTC(2026, 0, 1, 11, 2, 3)}
        label="Processing duration"
      />
    </VireoStorybookProvider>
  );
}
