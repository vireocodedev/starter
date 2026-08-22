import { type VireoSearchParamCodec, useVireoSearchParamState } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

type CustomerStatus = "active" | "archived";

const customerStatusCodec: VireoSearchParamCodec<CustomerStatus> = {
  parse: rawValue => {
    if (rawValue === "active" || rawValue === "archived") return rawValue;
    throw new Error("Unsupported customer status.");
  },
  serialize: value => value,
};

export default function CustomCodecExample() {
  const [status, setStatus] = useVireoSearchParamState("vireo-hook-status", {
    defaultValue: "active" as CustomerStatus,
    codec: customerStatusCodec,
  });

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Typography variant="h6">Customer status</Typography>
        <Typography color="text.secondary">Only values accepted by the application codec enter state.</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant={status === "active" ? "contained" : "outlined"} onClick={() => setStatus("active")}>
            Active
          </Button>
          <Button variant={status === "archived" ? "contained" : "outlined"} onClick={() => setStatus("archived")}>
            Archived
          </Button>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
