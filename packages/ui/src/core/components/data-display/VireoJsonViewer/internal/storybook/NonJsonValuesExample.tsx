import { VireoJsonViewer } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function NonJsonValuesExample() {
  const circular: Record<string, unknown> = { id: "circular-reference" };
  circular.self = circular;

  return (
    <VireoStorybookProvider>
      <VireoJsonViewer
        data={{
          error: new Error("Connection refused"),
          bigint: 9_007_199_254_740_993n,
          missing: undefined,
          transform: () => undefined,
          token: Symbol("private"),
          circular,
        }}
        copyLabel="Copy JSON to clipboard"
        copiedLabel="JSON copied"
      />
    </VireoStorybookProvider>
  );
}
