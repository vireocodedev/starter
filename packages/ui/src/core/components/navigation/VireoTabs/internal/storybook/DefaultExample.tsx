import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { VireoTabs } from "@vireocodedev/starter-ui";

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoTabs
        tabs={[
          { value: "overview", label: "Overview", content: "Account overview and recent activity." },
          { value: "security", label: "Security", content: "Password and authentication settings." },
          { value: "billing", label: "Billing", content: "Invoices and payment methods." },
        ]}
      />
    </VireoStorybookProvider>
  );
}
