import { VireoHistoryEntry } from "@vireocodedev/starter-ui";
import { createHistoryDefinitionBuilderFn } from "@vireocodedev/starter-history";
import { Box } from "@mui/material";
import { z } from "zod";

const AddressSchema = z.object({ city: z.string(), country: z.string(), postalCode: z.string() });
const CustomerSchema = z.object({ id: z.string(), name: z.string(), address: AddressSchema });

const buildAddressHistory = createHistoryDefinitionBuilderFn(AddressSchema);
const addressHistoryDefinition = buildAddressHistory(
  { label: "Address", key: address => `${address.country}-${address.postalCode}`, render: address => address.city },
  {
    city: { kind: "field", label: "City" },
    country: { kind: "field", label: "Country" },
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

export default function NestedExpansionExample() {
  return (
    <Box sx={{ maxWidth: 760 }}>
      <VireoHistoryEntry
        aria-label="Nested customer history"
        definition={customerHistoryDefinition}
        previous={{
          id: "CUS-10482",
          name: "Northstar Analytics",
          address: { city: "Zagreb", country: "Croatia", postalCode: "10000" },
        }}
        current={{
          id: "CUS-10482",
          name: "Northstar Analytics",
          address: { city: "Samobor", country: "Croatia", postalCode: "10430" },
        }}
        rootMeta="Address correction"
        defaultExpandedDepth={1}
      />
    </Box>
  );
}
