import { AspectRatioOutlined } from "@mui/icons-material";
import { MenuItem, Select } from "@mui/material";
import {
  VireoPageLayoutProvider,
  VireoPreferencePanel,
  createVireoPageLayout,
  type VireoPreferenceSectionDefinition,
} from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function CompactContainerLayoutExample() {
  const sections: readonly VireoPreferenceSectionDefinition[] = [
    {
      id: "layout",
      title: "Layout",
      items: [
        {
          id: "page-width",
          title: "Page content width",
          description: "Choose the maximum readable width for page content.",
          icon: <AspectRatioOutlined fontSize="small" />,
          control: (
            <Select fullWidth size="small" defaultValue="xl" inputProps={{ "aria-label": "Page content width" }}>
              <MenuItem value="md">Medium</MenuItem>
              <MenuItem value="xl">Extra large</MenuItem>
              <MenuItem value="full">No maximum</MenuItem>
            </Select>
          ),
        },
      ],
    },
  ];

  return (
    <VireoStorybookProvider>
      <VireoPageLayoutProvider value={createVireoPageLayout("compact")}>
        <div style={{ maxWidth: 420 }}>
          <VireoPreferencePanel
            sections={sections}
            emptyState="No preferences found."
            defaultExpandedSectionIds={["layout"]}
          />
        </div>
      </VireoPageLayoutProvider>
    </VireoStorybookProvider>
  );
}
