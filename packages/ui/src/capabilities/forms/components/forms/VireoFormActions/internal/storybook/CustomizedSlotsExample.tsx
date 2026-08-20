import { Button } from "@mui/material";
import { VireoFormActions } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoFormActions
        slots={{ layout: "nav" }}
        slotProps={{
          layout: {
            "aria-label": "Customer form actions",
            sx: { border: 1, borderColor: "primary.main", borderRadius: 1, p: 2 },
          },
        }}
      >
        <Button variant="text">Cancel</Button>
        <Button variant="contained">Create customer</Button>
      </VireoFormActions>
    </VireoStorybookProvider>
  );
}
