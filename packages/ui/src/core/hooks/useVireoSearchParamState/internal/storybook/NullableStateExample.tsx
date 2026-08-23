import { useVireoSearchParamState, vireoSearchParamCodecs } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { Button, Stack, Typography } from "@mui/material";

const customers = ["northstar", "atlas", "harbor"] as const;

export default function NullableStateExample() {
  const [customer, setCustomer] = useVireoSearchParamState("vireo-hook-customer", {
    defaultValue: null,
    codec: vireoSearchParamCodecs.string,
  });

  return (
    <VireoStorybookProvider>
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <Typography variant="h6">Selected customer</Typography>
        <Typography color="text.secondary">{customer ?? "No customer selected"}</Typography>
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {customers.map(value => (
            <Button
              key={value}
              variant={customer === value ? "contained" : "outlined"}
              onClick={() => setCustomer(value)}
            >
              {value}
            </Button>
          ))}
          <Button color="inherit" disabled={customer === null} onClick={() => setCustomer(null)}>
            Clear
          </Button>
        </Stack>
      </Stack>
    </VireoStorybookProvider>
  );
}
