import { VireoHistoryEntry } from "@vireocodedev/ui";
import { createHistoryDefinition } from "@vireocodedev/history";
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
const regionHistoryDefinition = createHistoryDefinition(
  RegionSchema,
  { label: "Region", key: region => region.country, format: region => region.county },
  {
    county: { kind: "field", label: "County" },
    country: { kind: "field", label: "Country" },
  },
);
const addressHistoryDefinition = createHistoryDefinition(
  AddressSchema,
  { label: "Address", key: address => address.postalCode, format: address => address.city },
  {
    city: { kind: "field", label: "City" },
    postalCode: { kind: "field", label: "Postal code" },
    region: { kind: "object", definition: regionHistoryDefinition },
  },
);
const contactHistoryDefinition = createHistoryDefinition(
  ContactSchema,
  { label: "Contact", key: contact => contact.phone, format: contact => contact.email },
  {
    email: { kind: "field", label: "Email" },
    phone: { kind: "field", label: "Phone" },
  },
);
const customerHistoryDefinition = createHistoryDefinition(
  CustomerSchema,
  { label: "Customer", key: customer => customer.id, format: customer => customer.name },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    address: { kind: "object", definition: addressHistoryDefinition },
    contact: { kind: "object", definition: contactHistoryDefinition },
  },
);

export default function MobileLayoutExample() {
  return (
    <Box sx={{ width: "100%", maxWidth: 390 }}>
      <VireoHistoryEntry
        definition={customerHistoryDefinition}
        previous={{
          id: "CUS-10482",
          name: "Northstar Labs",
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
        rootMeta="Today at 14:32 · Niko Barić"
        defaultExpandedDepth={3}
      />
    </Box>
  );
}
