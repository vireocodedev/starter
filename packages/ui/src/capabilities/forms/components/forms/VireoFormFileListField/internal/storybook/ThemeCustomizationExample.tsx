import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const initialFiles = [
  new File(["brand guide"], "brand-guide.pdf", { type: "application/pdf" }),
  new File(["logo usage"], "logo-usage.svg", { type: "image/svg+xml" }),
];

function createFileListFieldTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormFileListField: {
        defaultProps: { chooseFilesLabel: "Browse assets", addMoreFilesLabel: "Add assets" },
        styleOverrides: {
          root: { backgroundColor: "rgba(139, 92, 246, 0.08)", borderColor: "#8b5cf6" },
          chooser: { borderColor: "rgba(167, 139, 250, 0.6)" },
          selectButton: { borderColor: "#a78bfa", color: "#c4b5fd" },
          fileName: { color: "#ddd6fe" },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { assets: initialFiles } });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createFileListFieldTheme}>
        <form.Form>
          <form.Section label="Brand assets" variant="plain" layout="stack">
            <form.Field name="assets">
              {field => (
                <VireoLabelBox label="Asset files">
                  <field.FileListField slotProps={{ input: { "aria-label": "Asset files" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
