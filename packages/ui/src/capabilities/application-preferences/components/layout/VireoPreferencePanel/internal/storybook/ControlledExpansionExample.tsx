import React from "react";
import { DarkModeOutlined, TableRowsOutlined } from "@mui/icons-material";
import { Button, Switch, Typography } from "@mui/material";
import { VireoPreferencePanel, type VireoPreferenceSectionDefinition } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function ControlledExpansionExample() {
  const [expandedIds, setExpandedIds] = React.useState<readonly string[]>(["appearance"]);
  const sections: readonly VireoPreferenceSectionDefinition[] = [
    {
      id: "appearance",
      title: "Appearance",
      items: [
        {
          id: "theme",
          title: "Dark mode",
          icon: <DarkModeOutlined fontSize="small" />,
          control: <Switch slotProps={{ input: { "aria-label": "Dark mode" } }} />,
        },
      ],
    },
    {
      id: "tables",
      title: "Tables",
      items: [
        {
          id: "density",
          title: "Compact table density",
          icon: <TableRowsOutlined fontSize="small" />,
          control: <Switch slotProps={{ input: { "aria-label": "Compact tables" } }} />,
        },
      ],
    },
  ];

  return (
    <VireoStorybookProvider>
      <Button onClick={() => setExpandedIds(["appearance", "tables"])}>Expand all</Button>
      <Typography color="text.secondary" variant="body2" sx={{ my: 1.5 }}>
        Owned by the page: {expandedIds.join(", ") || "none"}
      </Typography>
      <VireoPreferencePanel
        sections={sections}
        emptyState="No preferences found."
        expandedSectionIds={expandedIds}
        onExpandedSectionIdsChange={setExpandedIds}
      />
    </VireoStorybookProvider>
  );
}
