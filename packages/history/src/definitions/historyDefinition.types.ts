import type { z } from "zod";

export type HistoryEntityKey = string | number;

export type HistoryChangeType = "added" | "removed" | "updated";

export type HistoryArrayMode = "set" | "ordered";

export type HistoryValueSide = "previous" | "current";

export type HistoryFormatContext<TParent> = {
  parent: NonNullable<TParent>;
  side: HistoryValueSide;
  path: readonly string[];
};

export type HistoryDefinitionOptions<TEntity extends object> = {
  label: string;
  key: (value: TEntity) => HistoryEntityKey;
  format?: (value: TEntity, context: HistoryFormatContext<TEntity>) => string;
};

export type HistoryFieldConfig<TValue, TParent> =
  | false
  | HistoryAtomicFieldConfig<TValue, TParent>
  | HistoryArrayFieldConfig<TValue, TParent>
  | HistoryObjectFieldConfig<TValue>;

export type HistoryAtomicFieldConfig<TValue, TParent> = {
  kind: "field";
  label: string;
  format?: (value: NonNullable<TValue>, context: HistoryFormatContext<TParent>) => string;
  resolveChange?: (previous: TValue, current: TValue) => HistoryChangeType | null;
};

export type HistoryArrayFieldConfig<TValue, TParent> =
  NonNullable<TValue> extends readonly (infer TItem)[]
    ? {
        kind: "array";
        label: string;
        /** @default "set" */
        mode?: HistoryArrayMode;
        format?: (value: NonNullable<TValue>, context: HistoryFormatContext<TParent>) => string;
        item: HistoryArrayItemConfig<TItem>;
      }
    : never;

export type HistoryArrayItemConfig<TItem> =
  HistoryAtomicFieldConfig<TItem, TItem> | HistoryArrayFieldConfig<TItem, TItem> | HistoryObjectFieldConfig<TItem>;

export type HistoryObjectFieldConfig<TValue> =
  NonNullable<TValue> extends object
    ? NonNullable<TValue> extends readonly unknown[]
      ? never
      : {
          kind: "object";
          definition: HistoryDefinition<NonNullable<TValue>>;
        }
    : never;

export type HistoryDefinitionFields<TEntity extends object> = {
  [TKey in keyof TEntity]-?: HistoryFieldConfig<TEntity[TKey], TEntity>;
};

export type HistoryDefinition<TEntity extends object, TSchema extends z.ZodTypeAny = z.ZodTypeAny> = {
  schema: TSchema;
  options: HistoryDefinitionOptions<TEntity>;
  fields: HistoryDefinitionFields<TEntity>;
};

export type HistoryEntityForDefinition<TDefinition> =
  TDefinition extends HistoryDefinition<infer TEntity, z.ZodTypeAny> ? TEntity : never;

export type HistoryObjectForSchema<TSchema extends z.ZodTypeAny> =
  NonNullable<z.infer<TSchema>> extends object
    ? NonNullable<z.infer<TSchema>> extends readonly unknown[]
      ? never
      : NonNullable<z.infer<TSchema>>
    : never;
