import { Stack, ThemeProvider, createTheme, type Theme } from "@mui/material";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoFormCheckboxField: {
        defaultProps: { labelPlacement: "start" },
        styleOverrides: {
          label: { color: "#c4b5fd", fontWeight: 700 },
          checked: {
            position: "relative",
            "&::before": {
              borderInlineStart: "3px solid",
              borderColor: "#34d399",
              borderRadius: 4,
              content: '""',
              insetBlock: 4,
              insetInlineStart: -10,
              position: "absolute",
            },
          },
        },
      },
    },
  });
}

export default function ThemeCustomizationExample() {
  const form = useVireoForm({
    defaultValues: { priorityReview: true },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <ThemeProvider theme={createCustomizedTheme}>
        <form.Form sx={{ maxWidth: 480 }}>
          <Stack spacing={2}>
            <form.Field name="priorityReview">
              {field => <field.CheckboxField label="Mark for priority review" />}
            </form.Field>
            <form.SubmitButton variant="contained">Save review preference</form.SubmitButton>
          </Stack>
        </form.Form>
      </ThemeProvider>
    </VireoStorybookProvider>
  );
}
