import { HISTORY_DEFAULT_EMPTY_VALUE } from "@/engine/history.engine.constants";
import { type HistoryEngineOptions } from "@/engine/history.engine.diff";
import {
  type AnyArrayFieldConfig,
  type AnyAtomicFieldConfig,
  type AnyHistoryDefinition,
  type HistoryRenderSide,
} from "@/engine/history.engine.types";
import { isEmptyHistoryValue, stableStringify } from "@/engine/history.engine.utils";

export function renderFieldValue(args: {
  config: AnyAtomicFieldConfig;
  value: unknown;
  parent: unknown;
  side: HistoryRenderSide;
  path: string[];
  options: HistoryEngineOptions;
}): React.ReactNode {
  const { config, value, parent, side, path, options } = args;

  if (isEmptyHistoryValue(value)) {
    return options.emptyValue ?? HISTORY_DEFAULT_EMPTY_VALUE;
  }

  if (config.render != null) {
    return config.render(value, {
      parent,
      side,
      path,
    });
  }

  return renderDefaultValue(value);
}

export function renderArrayValue(
  config: AnyArrayFieldConfig,
  value: unknown,
  path: string[],
): React.ReactNode | undefined {
  if (isEmptyHistoryValue(value)) {
    return undefined;
  }

  if (config.render == null) {
    return undefined;
  }

  return config.render(value, {
    parent: value,
    side: "current",
    path,
  });
}

export function renderDefinitionValue(
  definition: AnyHistoryDefinition,
  value: unknown,
  path: string[],
  options: HistoryEngineOptions,
): React.ReactNode {
  if (isEmptyHistoryValue(value)) {
    return options.emptyValue ?? HISTORY_DEFAULT_EMPTY_VALUE;
  }

  if (definition.options.render != null) {
    return definition.options.render(value, {
      parent: value,
      side: "current",
      path,
    });
  }

  return definition.options.label;
}

export function renderDefaultValue(value: unknown): React.ReactNode {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return stableStringify(value) ?? String(value);
}
