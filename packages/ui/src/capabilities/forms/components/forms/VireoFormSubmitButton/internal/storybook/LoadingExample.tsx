import { useVireoForm } from "@vireocodedev/ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

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
