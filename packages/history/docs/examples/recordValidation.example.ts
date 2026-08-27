import { createHistoryRecordSchema } from "@vireocodedev/history";
import { z } from "zod";

const CustomerHistoryRecordSchema = createHistoryRecordSchema({
  entityKind: z.literal("CUSTOMER"),
  snapshot: z.object({ name: z.string(), status: z.string() }),
});

export function runRecordValidationExample() {
  return CustomerHistoryRecordSchema.parse({
    id: "history-1",
    timestamp: "2026-08-22T12:00:00Z",
    actor: { id: "user-7", label: "Niko Barić" },
    entity: "CUSTOMER",
    entityId: "customer-42",
    snapshotPrevious: { name: "Northstar Labs", status: "prospect" },
    snapshotCurrent: { name: "Northstar Analytics", status: "active" },
  });
}
