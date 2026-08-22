import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const policies = [
  { value: "manual", label: "Review every request manually" },
  { value: "trusted", label: "Automatically approve requests from trusted teams" },
  { value: "all", label: "Automatically approve every request" },
] as const;

export default function VerticalOrientationExample() {
  const form = useVireoForm({ defaultValues: { policy: "manual" as string | null } });
  return (
    <VireoStorybookProvider>
      <form.Form layoutWidth="standard">
        <form.Section label="Approval policy" variant="plain" layout="stack">
          <form.Field name="policy">
            {field => (
              <VireoLabelBox label="Policy">
                <field.ToggleButtonGroupField orientation="vertical" aria-label="Policy" options={policies} />
              </VireoLabelBox>
            )}
          </form.Field>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
