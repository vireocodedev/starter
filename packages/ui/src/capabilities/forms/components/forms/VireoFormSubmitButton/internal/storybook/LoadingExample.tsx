import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function LoadingExample() {
  const form = useVireoForm({ defaultValues: {} });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Actions>
          <form.SubmitButton loading variant="contained">
            Publishing release
          </form.SubmitButton>
        </form.Actions>
      </form.Form>
    </VireoStorybookProvider>
  );
}
