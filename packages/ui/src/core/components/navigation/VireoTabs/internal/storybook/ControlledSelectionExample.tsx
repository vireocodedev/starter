import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import { VireoTabs } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";

export default function ControlledSelectionExample() {
  const [selectedTab, setSelectedTab] = React.useState("profile");

  return (
    <VireoStorybookProvider>
      <Stack
        spacing={2}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Button variant="outlined" onClick={() => setSelectedTab("billing")}>
          Open billing from application state
        </Button>
        <Typography color="text.secondary" variant="body2">
          Application selection: {selectedTab}
        </Typography>
        <VireoTabs
          value={selectedTab}
          onChange={setSelectedTab}
          tabs={[
            { value: "profile", label: "Profile", content: "Profile preferences." },
            { value: "security", label: "Security", content: "Authentication settings." },
            { value: "billing", label: "Billing", content: "Invoices and payment methods." },
          ]}
        />
      </Stack>
    </VireoStorybookProvider>
  );
}
