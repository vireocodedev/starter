import { createHistoryDefinition, createHistoryNodes } from "@vireocodedev/history";
import { z } from "zod";

const AddressSchema = z.object({ city: z.string(), country: z.string() });
const addressHistory = createHistoryDefinition(
  AddressSchema,
  { label: "Address", key: address => address.country, format: address => address.city },
  {
    city: { kind: "field", label: "City" },
    country: { kind: "field", label: "Country" },
  },
);

const CustomerSchema = z.object({ id: z.string(), address: AddressSchema });
const customerHistory = createHistoryDefinition(
  CustomerSchema,
  { label: "Customer", key: customer => customer.id },
  {
    id: false,
    address: { kind: "object", definition: addressHistory },
  },
);

export function runNestedDefinitionsExample() {
  return createHistoryNodes(
    customerHistory,
    { id: "customer-42", address: { city: "Zagreb", country: "HR" } },
    { id: "customer-42", address: { city: "Samobor", country: "HR" } },
  );
}
