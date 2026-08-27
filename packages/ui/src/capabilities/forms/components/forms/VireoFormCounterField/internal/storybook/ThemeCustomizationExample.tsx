import { ThemeProvider, createTheme, type Theme } from "@mui/material/styles";
import { VireoLabelBox } from "@vireocodedev/ui";
import { useVireoForm, vireoFormCounterFieldClasses } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { releaseCapacity: 4 as number | null },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider
        theme={outerTheme => {
          const theme = outerTheme as Theme;
          return createTheme(theme, {
            components: {
              VireoFormCounterField: {
                defaultProps: { size: "small", step: 2 },
                styleOverrides: {
                  input: {
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                  },
                  decrementButton: {
                    color: theme.palette.warning.light,
                    [`.${vireoFormCounterFieldClasses.atMin} &`]: { color: theme.palette.action.disabled },
                  },
                  incrementButton: {
                    color: theme.palette.warning.light,
                    [`.${vireoFormCounterFieldClasses.atMax} &`]: { color: theme.palette.action.disabled },
                  },
                },
              },
            },
          });
        }}
      >
        <form.Form>
          <form.Section label="Release limits" variant="plain" layout="stack">
            <form.Field name="releaseCapacity">
              {field => (
                <VireoLabelBox label="Concurrent releases">
                  <field.CounterField aria-label="Concurrent releases" min={0} max={10} />
                </VireoLabelBox>
              )}
            </form.Field>
          </form.Section>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
