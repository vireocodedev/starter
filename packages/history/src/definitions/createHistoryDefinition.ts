import type {
  HistoryDefinition,
  HistoryDefinitionFields,
  HistoryDefinitionOptions,
  HistoryObjectForSchema,
} from "./historyDefinition.types";
import type { z } from "zod";

export function createHistoryDefinition<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options: HistoryDefinitionOptions<HistoryObjectForSchema<TSchema>>,
  fields: HistoryDefinitionFields<HistoryObjectForSchema<TSchema>>,
): HistoryDefinition<HistoryObjectForSchema<TSchema>, TSchema> {
  return { schema, options, fields };
}
