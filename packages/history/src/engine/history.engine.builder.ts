import { type HistoryDefinitionBuilderForSchema } from "@/engine/history.engine.types";
import type z from "zod";

export function createHistoryDefinitionBuilderFn<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
): HistoryDefinitionBuilderForSchema<TSchema> {
  return ((options: unknown, fields: unknown) => ({
    schema,
    options,
    fields,
  })) as HistoryDefinitionBuilderForSchema<TSchema>;
}
