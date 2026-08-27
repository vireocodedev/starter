import React from "react";
import { DarkModeOutlined, RestartAltRounded } from "@mui/icons-material";
import { Button, Switch, Typography } from "@mui/material";
import { VireoPreferencePanel, type VireoPreferenceSectionDefinition } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function SectionActionsExample() {
  const [message, setMessage] = React.useState("The action is independent from the expansion toggle.");
  const sections: readonly VireoPreferenceSectionDefinition[] = [
    {
      id: "appearance",
      title: "Appearance",
      action: (
        <Button size="small" startIcon={<RestartAltRounded />} onClick={() => setMessage("Appearance reset.")}>
          Reset
        </Button>
      ),
      items: [
        {
          id: "theme",
          title: "Dark mode",
          icon: <DarkModeOutlined fontSize="small" />,
          control: <Switch slotProps={{ input: { "aria-label": "Dark mode" } }} />,
        },
      ],
    },
  ];

  return (
    <VireoStorybookProvider>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        {message}
      </Typography>
      <VireoPreferencePanel
        sections={sections}
        emptyState="No preferences found."
        defaultExpandedSectionIds={["appearance"]}
      />
    </VireoStorybookProvider>
  );
}
