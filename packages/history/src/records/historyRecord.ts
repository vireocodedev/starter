import { z } from "zod";

export type HistoryEntityKind = string;

export const HistorySnapshotSchema = z.record(z.string(), z.unknown());
export type HistorySnapshot = z.infer<typeof HistorySnapshotSchema>;

export const HistoryActorSchema = z.object({
  id: z.string().nullable().optional(),
  label: z.string().min(1),
});
export type HistoryActor = z.infer<typeof HistoryActorSchema>;

export interface HistoryRecord<
  TSnapshot extends HistorySnapshot = HistorySnapshot,
  TEntityKind extends HistoryEntityKind = HistoryEntityKind,
> {
  id: string;
  timestamp: number | string;
  actor: HistoryActor | null;
  entity: TEntityKind;
  entityId: string;
  snapshotPrevious: TSnapshot | null;
  snapshotCurrent: TSnapshot | null;
}

export function createHistoryRecordSchema(): z.ZodType<HistoryRecord, z.ZodTypeDef, unknown>;
export function createHistoryRecordSchema<TEntityKind extends HistoryEntityKind>(
  entityKindSchema: z.ZodType<TEntityKind, z.ZodTypeDef, unknown>,
): z.ZodType<HistoryRecord<HistorySnapshot, TEntityKind>, z.ZodTypeDef, unknown>;
export function createHistoryRecordSchema(
  entityKindSchema: z.ZodType<HistoryEntityKind, z.ZodTypeDef, unknown> = z.string(),
): z.ZodType<HistoryRecord, z.ZodTypeDef, unknown> {
  return z.object({
    id: z.string(),
    timestamp: z.union([z.number().finite(), z.string().min(1)]),
    actor: HistoryActorSchema.nullable(),
    entity: entityKindSchema,
    entityId: z.string(),
    snapshotPrevious: HistorySnapshotSchema.nullable(),
    snapshotCurrent: HistorySnapshotSchema.nullable(),
  }) as z.ZodType<HistoryRecord, z.ZodTypeDef, unknown>;
}

export const HistoryRecordSchema = createHistoryRecordSchema();
