import { VireoTabs } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function DisabledTabExample() {
  return (
    <VireoStorybookProvider>
      <VireoTabs
        tabs={[
          { value: "activity", label: "Activity", content: "Recent workspace activity." },
          { value: "members", label: "Members", content: "Workspace members and roles." },
          { value: "audit", label: "Audit log", content: "Audit access requires an upgraded plan.", disabled: true },
        ]}
      />
    </VireoStorybookProvider>
  );
}
