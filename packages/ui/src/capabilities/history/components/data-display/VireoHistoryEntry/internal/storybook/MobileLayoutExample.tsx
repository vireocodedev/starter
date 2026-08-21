import { VireoHistoryEntry } from "@vireocodedev/starter-ui";
import { createHistoryDefinitionBuilderFn } from "@vireocodedev/starter-history";
import { Box } from "@mui/material";
import { z } from "zod";

const AddressSchema = z.object({ city: z.string(), postalCode: z.string() });
const CustomerSchema = z.object({ id: z.string(), name: z.string(), address: AddressSchema });
const buildAddressHistory = createHistoryDefinitionBuilderFn(AddressSchema);
const addressHistoryDefinition = buildAddressHistory(
  { label: "Address", key: address => address.postalCode, render: address => address.city },
  {
    city: { kind: "field", label: "City" },
    postalCode: { kind: "field", label: "Postal code" },
  },
);
const buildCustomerHistory = createHistoryDefinitionBuilderFn(CustomerSchema);
const customerHistoryDefinition = buildCustomerHistory(
  { label: "Customer", key: customer => customer.id, render: customer => customer.name },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    address: { kind: "object", definition: addressHistoryDefinition },
  },
);

export default function MobileLayoutExample() {
  return (
    <Box sx={{ width: "100%", maxWidth: 390 }}>
      <VireoHistoryEntry
        definition={customerHistoryDefinition}
        previous={{ id: "CUS-10482", name: "Northstar Labs", address: { city: "Zagreb", postalCode: "10000" } }}
        current={{
          id: "CUS-10482",
          name: "Northstar Analytics",
          address: { city: "Samobor", postalCode: "10430" },
        }}
        rootMeta="Today at 14:32 · Niko Barić"
      />
    </Box>
  );
}
