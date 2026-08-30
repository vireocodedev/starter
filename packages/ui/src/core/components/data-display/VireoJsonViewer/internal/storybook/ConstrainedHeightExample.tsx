import { VireoJsonViewer } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

const records = Array.from({ length: 18 }, (_, index) => ({
  id: `record-${String(index + 1).padStart(2, "0")}`,
  state: index % 4 === 0 ? "warning" : "processed",
  durationMs: 120 + index * 17,
}));

export default function ConstrainedHeightExample() {
  return (
    <VireoStorybookProvider>
      <VireoJsonViewer
        data={{ event: "batch.completed", records }}
        copyLabel="Copy JSON to clipboard"
        copiedLabel="JSON copied"
        copyErrorLabel="Unable to copy JSON"
        maxHeight={220}
      />
    </VireoStorybookProvider>
  );
}
