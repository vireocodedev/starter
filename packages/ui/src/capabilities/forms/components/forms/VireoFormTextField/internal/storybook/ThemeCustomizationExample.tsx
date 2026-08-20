import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormTextField: {
        defaultProps: { size: "small" },
        styleOverrides: {
          htmlInput: { color: "#c4b5fd" },
          dirty: {
            position: "relative",
            "&::before": {
              borderInlineStart: "3px solid",
              borderColor: "#f59e0b",
              borderRadius: 4,
              content: '""',
              insetBlock: 4,
              insetInlineStart: -10,
              position: "absolute",
            },
          },
          errorVisible: { "&::before": { borderColor: "#f87171" } },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { releaseName: "" },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form>
          <form.Section label="Release" variant="plain" layout="stack">
            <form.Field
              name="releaseName"
              validators={{ onChange: ({ value }) => (value.trim() ? undefined : "A release name is required.") }}
            >
              {field => (
                <VireoLabelBox label="Release name">
                  <field.TextField
                    errorDisplay="always"
                    placeholder="August launch"
                    slotProps={{ htmlInput: { "aria-label": "Release name" } }}
                  />
                </VireoLabelBox>
              )}
            </form.Field>
            <form.Actions>
              <form.SubmitButton variant="contained">Create release</form.SubmitButton>
            </form.Actions>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
