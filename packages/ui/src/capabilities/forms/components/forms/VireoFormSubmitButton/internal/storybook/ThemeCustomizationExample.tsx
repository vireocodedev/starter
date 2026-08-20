import { ThemeProvider, createTheme, type Theme } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormSubmitButton: {
        defaultProps: { variant: "contained" },
        styleOverrides: {
          root: { fontWeight: 700 },
          loading: { backgroundColor: "#7c3aed" },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: {},
    onSubmit: async () => new Promise(resolve => setTimeout(resolve, 1200)),
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form>
          <form.Actions>
            <form.SubmitButton>Deploy application</form.SubmitButton>
          </form.Actions>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
