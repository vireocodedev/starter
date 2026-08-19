import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotExample({ delay }: { delay?: number }) {
  return (
    <VireoStorybookProvider>
      <VireoDelayedRender
        delay={delay}
        slots={{ root: "section" }}
        slotProps={{
          root: ownerState => ({
            "aria-label": "Customized delayed content",
            "data-delay": ownerState.delay,
            sx: { display: "block", border: 1, borderColor: "primary.main", borderRadius: 2, p: 2 },
          }),
        }}
      >
        Customized fallback content
      </VireoDelayedRender>
    </VireoStorybookProvider>
  );
}
