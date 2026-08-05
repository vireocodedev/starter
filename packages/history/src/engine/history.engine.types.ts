/* eslint-disable @typescript-eslint/no-explicit-any */

import type * as React from "react";
import type { z } from "zod";

export type HistoryEntityKey = string | number;

export type HistoryChangeType = "added" | "removed" | "updated";

export type HistoryArrayMode = "set" | "ordered";

export type HistoryRenderSide = "previous" | "current";

export type HistoryRenderContext<TParent> = {
  parent: NonNullable<TParent>;
  side: HistoryRenderSide;
  path: string[];
};

export type HistoryDefinitionOptions<TEntity> = {
  label: string;

  key: (value: NonNullable<TEntity>) => HistoryEntityKey;

  render?: (value: NonNullable<TEntity>, context: HistoryRenderContext<TEntity>) => React.ReactNode;
};

export type HistoryFieldConfig<TValue, TParent> =
  | false
  | HistoryAtomicFieldConfig<TValue, TParent>
  | HistoryArrayFieldConfig<TValue, TParent>
  | HistoryObjectFieldConfig<TValue>;

export type HistoryAtomicFieldConfig<TValue, TParent> = {
  kind: "field";

  label: string;

  render?: (value: NonNullable<TValue>, context: HistoryRenderContext<TParent>) => React.ReactNode;

  resolveChange?: (previous: TValue, current: TValue) => HistoryChangeType | null;
};

export type HistoryArrayFieldConfig<TValue, TParent> =
  NonNullable<TValue> extends readonly (infer TItem)[]
    ? {
        kind: "array";

        label: string;

        /**
         * Defaults to "set".
         *
         * "set"     = order ignored, items matched by identity.
         * "ordered" = order matters, moved rows may be emitted.
         */
        mode?: HistoryArrayMode;

        render?: (value: NonNullable<TValue>, context: HistoryRenderContext<TParent>) => React.ReactNode;

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

export type HistoryDefinitionFields<TEntity> = {
  [TKey in keyof TEntity]-?: HistoryFieldConfig<TEntity[TKey], TEntity>;
};

export type HistoryDefinition<TEntity = any, TSchema extends z.ZodTypeAny = z.ZodTypeAny> = {
  schema: TSchema;
  options: HistoryDefinitionOptions<TEntity>;
  fields: HistoryDefinitionFields<TEntity>;
};

export type HistoryDefinitionBuilder<TEntity, TSchema extends z.ZodTypeAny> = (
  options: HistoryDefinitionOptions<TEntity>,
  fields: HistoryDefinitionFields<TEntity>,
) => HistoryDefinition<TEntity, TSchema>;

export type HistoryDefinitionBuilderForSchema<TSchema extends z.ZodTypeAny> =
  NonNullable<z.infer<TSchema>> extends object
    ? NonNullable<z.infer<TSchema>> extends readonly unknown[]
      ? never
      : HistoryDefinitionBuilder<NonNullable<z.infer<TSchema>>, TSchema>
    : never;

export type HistoryFieldRow =
  | {
      type: "removed";
      path: string[];
      label: string;
      previous: React.ReactNode;
    }
  | {
      type: "updated";
      path: string[];
      label: string;
      previous: React.ReactNode;
      current: React.ReactNode;
    }
  | {
      type: "added";
      path: string[];
      label: string;
      current: React.ReactNode;
    }
  | {
      type: "moved";
      path: string[];
      label: string;
      previous: React.ReactNode;
      current: React.ReactNode;
    }
  | {
      type: "unchanged";
      path: string[];
      label: string;
      current: React.ReactNode;
    };

export type HistoryGroupChangeType = "added" | "updated" | "removed" | "unchanged";
export type HistoryGroupNode = {
  type: "group";
  path: string[];
  label: string;
  value?: React.ReactNode;
  changeType?: HistoryGroupChangeType;
  children: HistoryNode[];
};

export type HistoryNode = HistoryFieldRow | HistoryGroupNode;

export type AnyHistoryDefinition = HistoryDefinition<any, any>;

export type AnyHistoryFieldConfig = HistoryFieldConfig<any, any>;

export type AnyNonIgnoredHistoryFieldConfig = Exclude<AnyHistoryFieldConfig, false>;

export type AnyAtomicFieldConfig = Extract<AnyNonIgnoredHistoryFieldConfig, { kind: "field" }>;

export type AnyArrayFieldConfig = HistoryArrayFieldConfig<any, any>;

export type AnyArrayItemConfig = HistoryArrayItemConfig<any>;

export type AnyObjectFieldConfig = HistoryObjectFieldConfig<any>;
