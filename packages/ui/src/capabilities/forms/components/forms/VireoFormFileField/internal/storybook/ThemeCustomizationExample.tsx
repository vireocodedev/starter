import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const initialFile = new File(["brand guide"], "brand-guide.pdf", { type: "application/pdf" });

function createFileFieldTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormFileField: {
        defaultProps: { chooseFileLabel: "Browse", replaceFileLabel: "Choose another file" },
        styleOverrides: {
          root: { backgroundColor: "rgba(139, 92, 246, 0.08)", borderColor: "#8b5cf6" },
          selectButton: { borderColor: "#a78bfa", color: "#c4b5fd" },
          fileName: { color: "#ddd6fe" },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({ defaultValues: { guide: initialFile as File | null } });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createFileFieldTheme}>
        <form.Form>
          <form.Section label="Brand assets" variant="plain" layout="stack">
            <form.Field name="guide">
              {field => (
                <VireoLabelBox label="Brand guide">
                  <field.FileField slotProps={{ input: { "aria-label": "Brand guide" } }} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
