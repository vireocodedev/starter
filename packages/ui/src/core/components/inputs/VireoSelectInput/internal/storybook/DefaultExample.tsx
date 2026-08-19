import { VireoSelectInput } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";
const options = [
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
  { id: "support", label: "Support" },
];
export default function DefaultExample() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <VireoStorybookProvider>
      <VireoSelectInput
        value={value}
        onChange={setValue}
        options={options}
        getOptionValue={option => option.id}
        renderOption={option => option.label}
        label="Team"
        placeholder="Choose a team"
      />
    </VireoStorybookProvider>
  );
}
