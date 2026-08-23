import { z } from "zod";

export type HistoryEntityKind = string;
export type HistoryTimestamp = number | string;

export const HistorySnapshotSchema = z.record(z.string(), z.unknown());
export type HistorySnapshot = z.infer<typeof HistorySnapshotSchema>;

export const HistoryTimestampSchema = z.union([z.number().finite(), z.string().datetime({ offset: true })]);

export const HistoryActorSchema = z.object({
  id: z.string().min(1).nullable().optional(),
  label: z
    .string()
    .min(1)
    .refine(label => label.trim().length > 0, "History actor label cannot be blank."),
});
export type HistoryActor = z.infer<typeof HistoryActorSchema>;

export interface HistoryRecord<
  TSnapshot extends HistorySnapshot = HistorySnapshot,
  TEntityKind extends HistoryEntityKind = HistoryEntityKind,
  TTimestamp extends HistoryTimestamp = HistoryTimestamp,
> {
  id: string;
  timestamp: TTimestamp;
  actor: HistoryActor | null;
  entity: TEntityKind;
  entityId: string;
  snapshotPrevious: TSnapshot | null;
  snapshotCurrent: TSnapshot | null;
}

export type HistoryRecordSchemaOptions<
  TEntityKind extends HistoryEntityKind = HistoryEntityKind,
  TSnapshot extends HistorySnapshot = HistorySnapshot,
  TTimestamp extends HistoryTimestamp = HistoryTimestamp,
> = {
  entityKind?: z.ZodType<TEntityKind>;
  snapshot?: z.ZodType<TSnapshot>;
  timestamp?: z.ZodType<TTimestamp>;
};

export function createHistoryRecordSchema<
  TEntityKind extends HistoryEntityKind = HistoryEntityKind,
  TSnapshot extends HistorySnapshot = HistorySnapshot,
  TTimestamp extends HistoryTimestamp = HistoryTimestamp,
>(
  options: HistoryRecordSchemaOptions<TEntityKind, TSnapshot, TTimestamp> = {},
): z.ZodType<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>> {
  const entityKindSchema = options.entityKind ?? (z.string().min(1) as unknown as z.ZodType<TEntityKind>);
  const snapshotSchema = options.snapshot ?? (HistorySnapshotSchema as z.ZodType<TSnapshot>);
  const timestampSchema = options.timestamp ?? (HistoryTimestampSchema as unknown as z.ZodType<TTimestamp>);

  return z.object({
    id: z.string().min(1),
    timestamp: timestampSchema,
    actor: HistoryActorSchema.nullable(),
    entity: entityKindSchema,
    entityId: z.string().min(1),
    snapshotPrevious: snapshotSchema.nullable(),
    snapshotCurrent: snapshotSchema.nullable(),
  }) as z.ZodType<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>>;
}

export const HistoryRecordSchema = createHistoryRecordSchema();
