import { VireoJsonViewer } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CopyInteractionExample() {
  return (
    <VireoStorybookProvider>
      <VireoJsonViewer
        data={{ requestId: "req_01J5V8JH28X7K3P1", status: "failed" }}
        copyLabel="Copy JSON to clipboard"
        copiedLabel="JSON copied"
      />
    </VireoStorybookProvider>
  );
}
