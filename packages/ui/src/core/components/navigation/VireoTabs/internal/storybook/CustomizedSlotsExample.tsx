import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Paper } from "@mui/material";
import { VireoTabs } from "@vireocodedev/starter-ui";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoTabs
        tabs={[
          { value: "open", label: "Open", content: "12 open requests" },
          { value: "closed", label: "Closed", content: "48 closed requests" },
        ]}
        slots={{ root: "section" }}
        slotProps={{
          root: {
            "aria-label": "Customized VireoTabs",
            sx: { border: 1, borderColor: "primary.main", p: 2 },
          },
          tab: { sx: { textTransform: "none", fontWeight: 700 } },
          panel: { component: Paper, sx: { p: 2, bgcolor: "background.paper" } },
        }}
      />
    </VireoStorybookProvider>
  );
}
