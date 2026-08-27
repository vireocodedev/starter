import { DarkModeOutlined } from "@mui/icons-material";
import { Switch, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoPreferencePanel, type VireoPreferenceSectionDefinition } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

function createPreferenceTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoPreferencePanel: {
        defaultProps: { controlWidth: 280, stickySectionHeaders: false },
        styleOverrides: {
          sectionHeader: { backgroundColor: outerTheme.palette.primary.dark },
          itemIcon: { color: outerTheme.palette.secondary.main },
          item: { paddingBlock: outerTheme.spacing(3) },
        },
      },
    },
  });
}

const sections: readonly VireoPreferenceSectionDefinition[] = [
  {
    id: "appearance",
    title: "Appearance",
    items: [
      {
        id: "theme",
        title: "Dark mode",
        description: "Theme defaults and per-slot overrides apply consistently.",
        icon: <DarkModeOutlined fontSize="small" />,
        control: <Switch slotProps={{ input: { "aria-label": "Dark mode" } }} />,
      },
    ],
  },
];

export default function ThemeCustomizationExample() {
  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createPreferenceTheme}>
        <VireoPreferencePanel
          sections={sections}
          emptyState="No preferences found."
          defaultExpandedSectionIds={["appearance"]}
        />
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
