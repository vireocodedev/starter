import { createHistoryDefinition, createHistoryNodes, type HistoryNode } from "@vireocodedev/starter-history";
import { z } from "zod";

const ItemSchema = z.object({ id: z.union([z.string(), z.number()]), name: z.string() });
const itemHistory = createHistoryDefinition(
  ItemSchema,
  { label: "Item", key: item => item.id },
  { id: false, name: { kind: "field", label: "Name" } },
);
const ListSchema = z.object({ items: z.array(ItemSchema) });
const listHistory = createHistoryDefinition(
  ListSchema,
  { label: "List", key: () => "list" },
  { items: { kind: "array", label: "Items", item: { kind: "object", definition: itemHistory } } },
);

function flatten(nodes: readonly HistoryNode[]): HistoryNode[] {
  return nodes.flatMap(node => (node.type === "group" ? [node, ...flatten(node.children)] : [node]));
}

export function runNodeModelExample() {
  const nodes = createHistoryNodes(
    listHistory,
    { items: [] },
    {
      items: [
        { id: 1, name: "Numeric identity" },
        { id: "1", name: "String identity" },
      ],
    },
  );

  return flatten(nodes).map(node => ({
    type: node.type,
    path: node.path,
    pathSegmentTypes: node.path.map(segment => typeof segment),
  }));
}
