import { VireoJsonViewer } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const diagnosticData = {
  requestId: "req_01J5V8JH28X7K3P1",
  status: "failed",
  durationMs: 842,
  error: { code: "UPSTREAM_TIMEOUT", message: "The upstream service did not respond in time." },
  attempts: [
    { number: 1, outcome: "timeout" },
    { number: 2, outcome: "timeout" },
  ],
};

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoJsonViewer
        data={diagnosticData}
        copyLabel="Copy JSON to clipboard"
        copiedLabel="JSON copied"
        copyErrorLabel="Unable to copy JSON"
      />
    </VireoStorybookProvider>
  );
}
