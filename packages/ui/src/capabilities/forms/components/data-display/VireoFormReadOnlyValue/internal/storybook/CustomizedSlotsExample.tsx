import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { VireoFormReadOnlyValue } from "@vireocodedev/ui/forms";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormReadOnlyValue
        empty
        emptyValue="No phone number"
        label="Phone"
        slots={{ root: "section", value: "span" }}
        slotProps={{
          root: {
            "aria-label": "Customized VireoFormReadOnlyValue",
            sx: { border: 1, borderColor: "primary.main", p: 2 },
          },
        }}
      />
    </VireoStorybookProvider>
  );
}
