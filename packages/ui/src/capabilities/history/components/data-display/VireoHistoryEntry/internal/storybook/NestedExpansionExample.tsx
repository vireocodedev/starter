import { VireoHistoryEntry } from "@vireocodedev/starter-ui";
import { createHistoryDefinitionBuilderFn } from "@vireocodedev/starter-history";
import { Box } from "@mui/material";
import { z } from "zod";

const RegionSchema = z.object({ county: z.string(), country: z.string() });
const AddressSchema = z.object({ city: z.string(), postalCode: z.string(), region: RegionSchema });
const ContactSchema = z.object({ email: z.string(), phone: z.string() });
const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: AddressSchema,
  contact: ContactSchema,
});

const buildRegionHistory = createHistoryDefinitionBuilderFn(RegionSchema);
const regionHistoryDefinition = buildRegionHistory(
  { label: "Region", key: region => region.country, render: region => region.county },
  {
    county: { kind: "field", label: "County" },
    country: { kind: "field", label: "Country" },
  },
);
const buildAddressHistory = createHistoryDefinitionBuilderFn(AddressSchema);
const addressHistoryDefinition = buildAddressHistory(
  { label: "Address", key: address => address.postalCode, render: address => address.city },
  {
    city: { kind: "field", label: "City" },
    postalCode: { kind: "field", label: "Postal code" },
    region: { kind: "object", definition: regionHistoryDefinition },
  },
);
const buildContactHistory = createHistoryDefinitionBuilderFn(ContactSchema);
const contactHistoryDefinition = buildContactHistory(
  { label: "Contact", key: contact => contact.phone, render: contact => contact.email },
  {
    email: { kind: "field", label: "Email" },
    phone: { kind: "field", label: "Phone" },
  },
);

const buildCustomerHistory = createHistoryDefinitionBuilderFn(CustomerSchema);
const customerHistoryDefinition = buildCustomerHistory(
  { label: "Customer", key: customer => customer.id, render: customer => customer.name },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    address: { kind: "object", definition: addressHistoryDefinition },
    contact: { kind: "object", definition: contactHistoryDefinition },
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
          address: {
            city: "Zagreb",
            postalCode: "10000",
            region: { county: "City of Zagreb", country: "Croatia" },
          },
          contact: { email: "operations@northstar.example", phone: "+385 1 555 0142" },
        }}
        current={{
          id: "CUS-10482",
          name: "Northstar Analytics",
          address: {
            city: "Samobor",
            postalCode: "10430",
            region: { county: "Zagreb County", country: "Croatia" },
          },
          contact: { email: "support@northstar.example", phone: "+385 1 555 0142" },
        }}
        rootMeta="Customer profile update"
        defaultExpandedDepth={3}
      />
    </Box>
  );
}
