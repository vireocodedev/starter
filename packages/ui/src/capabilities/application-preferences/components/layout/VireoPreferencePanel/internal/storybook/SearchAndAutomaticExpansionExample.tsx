import React from "react";
import { DarkModeOutlined, TableRowsOutlined } from "@mui/icons-material";
import { InputAdornment, Switch, TextField } from "@mui/material";
import { VireoPreferencePanel, type VireoPreferenceSectionDefinition } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function SearchAndAutomaticExpansionExample() {
  const [query, setQuery] = React.useState("density");
  const sections: readonly VireoPreferenceSectionDefinition[] = [
    {
      id: "appearance",
      title: "Appearance",
      items: [
        {
          id: "theme",
          title: "Dark mode",
          description: "Use the dark workspace palette.",
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
          title: "Table density",
          description: "Choose how much vertical space data tables use.",
          searchKeywords: ["compact", "comfortable"],
          icon: <TableRowsOutlined fontSize="small" />,
          control: <Switch slotProps={{ input: { "aria-label": "Compact tables" } }} />,
        },
      ],
    },
  ];

  return (
    <VireoStorybookProvider>
      <TextField
        fullWidth
        label="Search preferences"
        value={query}
        onChange={event => setQuery(event.target.value)}
        slotProps={{ input: { startAdornment: <InputAdornment position="start">⌕</InputAdornment> } }}
        sx={{ mb: 2 }}
      />
      <VireoPreferencePanel sections={sections} searchQuery={query} emptyState={<>No preferences match “{query}”.</>} />
    </VireoStorybookProvider>
  );
}
