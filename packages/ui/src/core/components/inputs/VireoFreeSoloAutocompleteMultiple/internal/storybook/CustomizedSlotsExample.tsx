import { VireoFreeSoloAutocompleteMultiple } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Add } from "@mui/icons-material";
import React from "react";
const options = [
  { id: "bug", label: "Bug" },
  { id: "feature", label: "Feature" },
];
export default function CustomizedSlotsExample() {
  const [value, setValue] = React.useState<string[] | null>(["bug", "customer-request"]);
  return (
    <VireoStorybookProvider>
      <VireoFreeSoloAutocompleteMultiple
        value={value}
        onChange={setValue}
        options={options}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getStringValue={option => option.id}
        createSyntheticOption={text => ({ id: text, label: text })}
        addLabel={text => `Create “${text}”`}
        addIcon={<Add />}
        slots={{ root: "section" }}
        slotProps={{ root: { "aria-label": "Issue labels", sx: { p: 2, border: 1, borderColor: "divider" } } }}
        textFieldProps={{ label: "Labels" }}
      />
    </VireoStorybookProvider>
  );
}
