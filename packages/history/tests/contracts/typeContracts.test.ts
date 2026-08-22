import { createHistoryDefinition, createHistoryNodes } from "@/index";
import { describe, it } from "vitest";
import { z } from "zod";

describe("starter-history type contracts", () => {
  it("infers inline snapshot literals exclusively from the definition", () => {
    const schema = z.object({ id: z.string(), status: z.enum(["active", "inactive"]) });
    const definition = createHistoryDefinition(
      schema,
      { label: "Entity", key: entity => entity.id },
      { id: false, status: { kind: "field", label: "Status" } },
    );

    createHistoryNodes(definition, { id: "1", status: "active" }, { id: "1", status: "inactive" });
  });
});
