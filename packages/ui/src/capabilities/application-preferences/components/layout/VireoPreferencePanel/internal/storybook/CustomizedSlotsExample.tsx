import { TuneRounded } from "@mui/icons-material";
import { Switch } from "@mui/material";
import { VireoPreferencePanel, type VireoPreferenceSectionDefinition } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const sections: readonly VireoPreferenceSectionDefinition[] = [
  {
    id: "behavior",
    title: "Behavior",
    items: [
      {
        id: "animations",
        title: "Interface animations",
        description: "Keep motion enabled for navigation and overlays.",
        icon: <TuneRounded fontSize="small" />,
        control: <Switch slotProps={{ input: { "aria-label": "Interface animations" } }} />,
      },
    ],
  },
];

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoPreferencePanel
        sections={sections}
        emptyState="No preferences found."
        defaultExpandedSectionIds={["behavior"]}
        slots={{ item: "article" }}
        slotProps={{
          item: ownerState => ({
            "data-layout": ownerState.isCompact ? "compact" : "regular",
            sx: { borderInlineStart: 3, borderInlineStartColor: "primary.main" },
          }),
          itemTitle: { component: "h3" },
        }}
      />
    </VireoStorybookProvider>
  );
}
