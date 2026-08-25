import React from "react";
import { AspectRatioOutlined, DarkModeOutlined, SearchRounded, TableRowsOutlined } from "@mui/icons-material";
import { InputAdornment, MenuItem, Select, Switch, TextField } from "@mui/material";
import {
  VireoPage,
  VireoPageBody,
  VireoPageHeader,
  VireoPreferencePanel,
  type VireoPreferenceSectionDefinition,
} from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function DefaultExample() {
  const [search, setSearch] = React.useState("");
  const [darkMode, setDarkMode] = React.useState(true);
  const sections: readonly VireoPreferenceSectionDefinition[] = [
    {
      id: "appearance",
      title: "Appearance",
      items: [
        {
          id: "theme",
          title: "Dark mode",
          description: "Use the dark workspace palette throughout the application.",
          icon: <DarkModeOutlined fontSize="small" />,
          control: (
            <Switch
              checked={darkMode}
              onChange={(_, checked) => setDarkMode(checked)}
              slotProps={{ input: { "aria-label": "Dark mode" } }}
            />
          ),
        },
        {
          id: "table-density",
          title: "Table density",
          description: "Choose how much vertical space responsive tables use.",
          icon: <TableRowsOutlined fontSize="small" />,
          control: (
            <Select fullWidth size="small" defaultValue="comfortable" inputProps={{ "aria-label": "Table density" }}>
              <MenuItem value="compact">Compact</MenuItem>
              <MenuItem value="comfortable">Comfortable</MenuItem>
            </Select>
          ),
        },
      ],
    },
    {
      id: "layout",
      title: "Layout",
      items: [
        {
          id: "page-width",
          title: "Page content width",
          description: "Constrain content for readability or use all available space.",
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
      <VireoPage mode="regular">
        <VireoPageHeader
          title="Application preferences"
          actions={
            <TextField
              size="small"
              placeholder="Search preferences"
              value={search}
              onChange={event => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
                htmlInput: { "aria-label": "Search preferences" },
              }}
            />
          }
        />
        <VireoPageBody>
          <VireoPreferencePanel
            sections={sections}
            searchQuery={search}
            emptyState={<>No preferences match “{search}”.</>}
            defaultExpandedSectionIds={["appearance", "layout"]}
            sx={{ mt: 2 }}
          />
        </VireoPageBody>
      </VireoPage>
    </VireoStorybookProvider>
  );
}
