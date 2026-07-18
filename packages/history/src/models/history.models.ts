import z from "zod";

/**
 * Entity kinds are opaque strings at the library level. The consuming app owns
 * its concrete entity-kind set and injects a validating schema via
 * {@link createHistorySchemas} (e.g. `z.enum(["INVOICE", "BUYER", ...])`).
 */
export type HistoryEntityKind = string;

/** A single entity snapshot: an opaque bag of field values. */
export const HistorySnapshotSchema = z.record(z.string(), z.unknown());
export type HistorySnapshot = z.infer<typeof HistorySnapshotSchema>;

/**
 * A history record for one entity change. Generic over the snapshot shape so
 * consumers can narrow `snapshotPrevious` / `snapshotCurrent` to their model.
 */
export interface History<TSnapshot extends HistorySnapshot = HistorySnapshot> {
  id: string;
  timestamp: number | string;
  ownerId?: string | null;
  ownerUsername: string;
  entity: HistoryEntityKind;
  entityId: string;
  snapshotPrevious: TSnapshot | null;
  snapshotCurrent: TSnapshot | null;
}

export type HistorySchemas = {
  history: z.ZodType<History, z.ZodTypeDef, unknown>;
};

/**
 * Builds the `History` parse schema from a (optional) entity-kind schema. Pass
 * your app's `z.enum([...])` to validate/narrow the `entity` field; the default
 * accepts any string.
 */
export function createHistorySchemas(
  entityKindSchema: z.ZodType<HistoryEntityKind, z.ZodTypeDef, unknown> = z.string(),
): HistorySchemas {
  const history = z.object({
    id: z.string(),
    timestamp: z.union([z.number(), z.string()]),
    ownerId: z.string().nullable().optional(),
    ownerUsername: z.string(),
    entity: entityKindSchema,
    entityId: z.string(),
    snapshotPrevious: HistorySnapshotSchema.nullable(),
    snapshotCurrent: HistorySnapshotSchema.nullable(),
  }) satisfies z.ZodType<History, z.ZodTypeDef, unknown>;

  return { history };
}
