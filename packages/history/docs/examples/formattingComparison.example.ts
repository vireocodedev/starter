import { createHistoryDefinition, createHistoryNodes } from "@vireocodedev/history";
import { z } from "zod";

const InvoiceSchema = z.object({
  id: z.string(),
  customer: z.string(),
  total: z.number(),
  issuedAt: z.date(),
});

const invoiceHistory = createHistoryDefinition(
  InvoiceSchema,
  { label: "Invoice", key: invoice => invoice.id },
  {
    id: false,
    customer: {
      kind: "field",
      label: "Customer",
      resolveChange: (previous, current) =>
        previous.localeCompare(current, undefined, { sensitivity: "base" }) === 0 ? null : "updated",
    },
    total: {
      kind: "field",
      label: "Total",
      format: total => new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(total),
    },
    issuedAt: { kind: "field", label: "Issued at" },
  },
);

export function runFormattingComparisonExample() {
  return createHistoryNodes(
    invoiceHistory,
    { id: "invoice-7", customer: "Northstar", total: 100, issuedAt: new Date("2026-08-20T10:00:00Z") },
    { id: "invoice-7", customer: "NORTHSTAR", total: 125, issuedAt: new Date("2026-08-21T10:00:00Z") },
  );
}
