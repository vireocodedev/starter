import { createHistoryDefinition, createHistoryNodes } from "@vireocodedev/starter-history";
import { z } from "zod";

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["prospect", "active"]),
});

const customerHistory = createHistoryDefinition(
  CustomerSchema,
  {
    label: "Customer",
    key: customer => customer.id,
    format: customer => customer.name,
  },
  {
    id: false,
    name: { kind: "field", label: "Name" },
    status: {
      kind: "field",
      label: "Status",
      format: status => status[0]?.toUpperCase() + status.slice(1),
    },
  },
);

export function runPrimaryWorkflowExample() {
  const previous: z.infer<typeof CustomerSchema> = {
    id: "customer-42",
    name: "Northstar Labs",
    status: "prospect",
  };
  const current: z.infer<typeof CustomerSchema> = {
    id: "customer-42",
    name: "Northstar Analytics",
    status: "active",
  };

  return createHistoryNodes(customerHistory, previous, current);
}
