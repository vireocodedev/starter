import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { VireoTabs, type VireoTabsProps } from "@vireocodedev/ui";

export default function DefaultExample({ onChange }: Pick<VireoTabsProps, "onChange">) {
  return (
    <VireoStorybookProvider>
      <VireoTabs
        tabs={[
          { value: "overview", label: "Overview", content: "Account overview and recent activity." },
          { value: "security", label: "Security", content: "Password and authentication settings." },
          { value: "billing", label: "Billing", content: "Invoices and payment methods." },
        ]}
        onChange={onChange}
      />
    </VireoStorybookProvider>
  );
}
