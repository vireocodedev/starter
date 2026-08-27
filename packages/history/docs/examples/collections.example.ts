import { createHistoryDefinition, createHistoryNodes } from "@vireocodedev/history";
import { z } from "zod";

const StepSchema = z.object({ id: z.string(), title: z.string() });
const stepHistory = createHistoryDefinition(
  StepSchema,
  { label: "Step", key: step => step.id, format: step => step.title },
  { id: false, title: { kind: "field", label: "Title" } },
);

const WorkflowSchema = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  steps: z.array(StepSchema),
});
const workflowHistory = createHistoryDefinition(
  WorkflowSchema,
  { label: "Workflow", key: workflow => workflow.id },
  {
    id: false,
    tags: {
      kind: "array",
      label: "Tags",
      mode: "set",
      item: { kind: "field", label: "Tag" },
    },
    steps: {
      kind: "array",
      label: "Steps",
      mode: "ordered",
      item: { kind: "object", definition: stepHistory },
    },
  },
);

export function runCollectionsExample() {
  return createHistoryNodes(
    workflowHistory,
    {
      id: "workflow-1",
      tags: ["customer", "review"],
      steps: [
        { id: "draft", title: "Draft" },
        { id: "approve", title: "Approve" },
      ],
    },
    {
      id: "workflow-1",
      tags: ["review", "priority"],
      steps: [
        { id: "approve", title: "Approve" },
        { id: "draft", title: "Draft" },
      ],
    },
  );
}
