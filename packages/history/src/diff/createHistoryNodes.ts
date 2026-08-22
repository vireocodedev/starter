import type {
  HistoryArrayFieldConfig,
  HistoryArrayItemConfig,
  HistoryAtomicFieldConfig,
  HistoryDefinition,
  HistoryEntityKey,
  HistoryFieldConfig,
  HistoryObjectFieldConfig,
} from "../definitions/historyDefinition.types";
import { areHistoryValuesEqual, formatHistoryValue, isHistoryValuePresent, stableStringify } from "./historyValue";
import type {
  HistoryEngineOptions,
  HistoryFieldRow,
  HistoryGroupChangeType,
  HistoryGroupNode,
  HistoryNode,
  HistoryValue,
} from "./historyNode.types";
import type { z } from "zod";

const DEFAULT_POSITION_LABEL = "Position";

// These erased forms are implementation details; consumers use the typed
// definition/config contracts exported from the package root.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalHistoryDefinition = HistoryDefinition<any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalFieldConfig = HistoryFieldConfig<any, any>;
type InternalNonIgnoredFieldConfig = Exclude<InternalFieldConfig, false>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalAtomicFieldConfig = HistoryAtomicFieldConfig<any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalArrayFieldConfig = HistoryArrayFieldConfig<any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalArrayItemConfig = HistoryArrayItemConfig<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InternalObjectFieldConfig = HistoryObjectFieldConfig<any>;

export function createHistoryNodes<TEntity extends object, TSchema extends z.ZodTypeAny>(
  definition: HistoryDefinition<TEntity, TSchema>,
  previous: TEntity | null | undefined,
  current: TEntity | null | undefined,
  options: HistoryEngineOptions = {},
): HistoryNode[] {
  const previousParsed = parseOptionalSnapshot(definition, previous);
  const currentParsed = parseOptionalSnapshot(definition, current);

  const group = createHistoryGroup(definition, previousParsed, currentParsed, [], options);

  return group == null ? [] : [group];
}

function createHistoryGroup(
  definition: InternalHistoryDefinition,
  previous: unknown,
  current: unknown,
  path: string[],
  options: HistoryEngineOptions = {},
  changeType?: HistoryGroupChangeType,
): HistoryGroupNode | null {
  const children = createFieldNodesForDefinition(definition, previous, current, path, options);

  if (children.length === 0) {
    return null;
  }

  return {
    type: "group",
    path,
    label: definition.options.label,
    value: formatDefinitionValue(
      definition,
      isHistoryValuePresent(current) ? current : previous,
      path,
      isHistoryValuePresent(current) ? "current" : "previous",
    ),
    changeType: changeType ?? resolveDefaultGroupChangeType(children),
    children,
  };
}

function parseOptionalSnapshot(definition: InternalHistoryDefinition, value: unknown): unknown {
  if (!isHistoryValuePresent(value)) {
    return undefined;
  }

  return definition.schema.parse(value);
}

function createFieldNodesForDefinition(
  definition: InternalHistoryDefinition,
  previous: unknown,
  current: unknown,
  path: string[],
  options: HistoryEngineOptions,
): HistoryNode[] {
  const directNodes: HistoryNode[] = [];
  const nestedNodes: HistoryNode[] = [];

  for (const fieldName of Object.keys(definition.fields)) {
    const fieldConfig = definition.fields[fieldName] as InternalFieldConfig;

    if (fieldConfig === false) {
      continue;
    }

    const fieldPath = [...path, fieldName];
    const previousValue = getObjectFieldValue(previous, fieldName);
    const currentValue = getObjectFieldValue(current, fieldName);

    const nodes = createFieldNodes({
      config: fieldConfig,
      previous: previousValue,
      current: currentValue,
      previousParent: previous,
      currentParent: current,
      path: fieldPath,
      options,
    });

    if (fieldConfig.kind === "field") {
      directNodes.push(...nodes);
      continue;
    }

    nestedNodes.push(...nodes);
  }

  return [...sortHistoryNodesByChangeType(directNodes), ...sortHistoryNodesByChangeType(nestedNodes)];
}

function createFieldNodes(args: {
  config: InternalNonIgnoredFieldConfig;
  previous: unknown;
  current: unknown;
  previousParent: unknown;
  currentParent: unknown;
  path: string[];
  options: HistoryEngineOptions;
}): HistoryNode[] {
  const { config } = args;

  switch (config.kind) {
    case "field": {
      const row = createAtomicFieldRow({
        ...args,
        config,
      });

      return row == null ? [] : [row];
    }

    case "array": {
      return createArrayGroup({
        ...args,
        config,
      });
    }

    case "object": {
      return createObjectGroup({
        ...args,
        config,
      });
    }

    default: {
      return [];
    }
  }
}

function createAtomicFieldRow(args: {
  config: InternalAtomicFieldConfig;
  previous: unknown;
  current: unknown;
  previousParent: unknown;
  currentParent: unknown;
  path: string[];
  options: HistoryEngineOptions;
}): HistoryFieldRow | null {
  const { config, previous, current, previousParent, currentParent, path, options } = args;

  const changeType = config.resolveChange?.(previous, current) ?? resolveDefaultFieldChange(previous, current);

  if (changeType == null) {
    return createUnchangedFieldRow({
      config,
      previous,
      current,
      previousParent,
      currentParent,
      path,
      options,
    });
  }

  if (changeType === "removed") {
    return {
      type: "removed",
      path,
      label: config.label,
      previous: formatFieldValue({
        config,
        value: previous,
        parent: previousParent,
        side: "previous",
        path,
        options,
      }),
    };
  }

  if (changeType === "added") {
    return {
      type: "added",
      path,
      label: config.label,
      current: formatFieldValue({
        config,
        value: current,
        parent: currentParent,
        side: "current",
        path,
        options,
      }),
    };
  }

  return {
    type: "updated",
    path,
    label: config.label,
    previous: formatFieldValue({
      config,
      value: previous,
      parent: previousParent,
      side: "previous",
      path,
      options,
    }),
    current: formatFieldValue({
      config,
      value: current,
      parent: currentParent,
      side: "current",
      path,
      options,
    }),
  };
}

function createUnchangedFieldRow(args: {
  config: InternalAtomicFieldConfig;
  previous: unknown;
  current: unknown;
  previousParent: unknown;
  currentParent: unknown;
  path: string[];
  options: HistoryEngineOptions;
}): HistoryFieldRow | null {
  const { config, previous, current, previousParent, currentParent, path, options } = args;

  if (options.showUnchanged !== true) {
    return null;
  }

  const value = isHistoryValuePresent(current) ? current : previous;

  if (!isHistoryValuePresent(value)) {
    return null;
  }

  const parent = isHistoryValuePresent(current) ? currentParent : previousParent;
  const side = isHistoryValuePresent(current) ? "current" : "previous";

  return {
    type: "unchanged",
    path,
    label: config.label,
    current: formatFieldValue({
      config,
      value,
      parent,
      side,
      path,
      options,
    }),
  };
}

function createObjectGroup(args: {
  config: InternalObjectFieldConfig;
  previous: unknown;
  current: unknown;
  path: string[];
  options: HistoryEngineOptions;
}): HistoryNode[] {
  const { config, previous, current, path, options } = args;

  const group = createHistoryGroup(
    config.definition,
    previous,
    current,
    path,
    options,
    resolveContainerChangeType(previous, current),
  );

  return group == null ? [] : [group];
}

function resolveContainerChangeType(previous: unknown, current: unknown): HistoryGroupChangeType | undefined {
  const previousEmpty = !isHistoryValuePresent(previous);
  const currentEmpty = !isHistoryValuePresent(current);

  if (previousEmpty && !currentEmpty) {
    return "added";
  }

  if (!previousEmpty && currentEmpty) {
    return "removed";
  }

  return undefined;
}

function createArrayGroup(args: {
  config: InternalArrayFieldConfig;
  previous: unknown;
  current: unknown;
  previousParent: unknown;
  currentParent: unknown;
  path: string[];
  options: HistoryEngineOptions;
}): HistoryNode[] {
  const { config, previous, current, previousParent, currentParent, path, options } = args;

  const previousArray = Array.isArray(previous) ? previous : [];
  const currentArray = Array.isArray(current) ? current : [];

  const mode = config.mode ?? "set";

  const children =
    mode === "ordered"
      ? createOrderedArrayChildren(config, previousArray, currentArray, path, options)
      : createSetArrayChildren(config, previousArray, currentArray, path, options);

  if (children.length === 0) {
    return [];
  }

  return [
    {
      type: "group",
      path,
      label: config.label,
      value: formatArrayValue(
        config,
        isHistoryValuePresent(current) ? currentArray : previousArray,
        isHistoryValuePresent(current) ? currentParent : previousParent,
        path,
        isHistoryValuePresent(current) ? "current" : "previous",
      ),
      changeType: resolveDefaultGroupChangeType(children),
      children,
    },
  ];
}

function createSetArrayChildren(
  config: InternalArrayFieldConfig,
  previousArray: unknown[],
  currentArray: unknown[],
  path: string[],
  options: HistoryEngineOptions,
): HistoryNode[] {
  const previousItems = createArrayItemMap(config, previousArray);
  const currentItems = createArrayItemMap(config, currentArray);

  const addedChildren: HistoryNode[] = [];
  const updatedChildren: HistoryNode[] = [];
  const removedChildren: HistoryNode[] = [];

  for (const [key, currentEntry] of currentItems) {
    const previousEntry = previousItems.get(key);
    const itemPath = [...path, String(key)];

    if (previousEntry == null) {
      addedChildren.push(...createAddedArrayItemNodes(config, currentEntry.value, itemPath, options));
      continue;
    }

    updatedChildren.push(
      ...createMatchedArrayItemNodes({
        config,
        previous: previousEntry.value,
        current: currentEntry.value,
        path: itemPath,
        movedRow: null,
        options,
      }),
    );
  }

  for (const [key, previousEntry] of previousItems) {
    if (currentItems.has(key)) {
      continue;
    }

    removedChildren.push(...createRemovedArrayItemNodes(config, previousEntry.value, [...path, String(key)], options));
  }

  return sortHistoryNodesByChangeType([...addedChildren, ...updatedChildren, ...removedChildren]);
}

function createOrderedArrayChildren(
  config: InternalArrayFieldConfig,
  previousArray: unknown[],
  currentArray: unknown[],
  path: string[],
  options: HistoryEngineOptions,
): HistoryNode[] {
  const previousItems = createArrayItemMap(config, previousArray);
  const currentItems = createArrayItemMap(config, currentArray);

  const addedChildren: HistoryNode[] = [];
  const updatedChildren: HistoryNode[] = [];
  const removedChildren: HistoryNode[] = [];

  for (const [key, currentEntry] of currentItems) {
    const previousEntry = previousItems.get(key);
    const itemPath = [...path, String(key)];

    if (previousEntry == null) {
      addedChildren.push(...createAddedArrayItemNodes(config, currentEntry.value, itemPath, options));
      continue;
    }

    const movedRow =
      previousEntry.index === currentEntry.index
        ? null
        : createMovedRow(itemPath, previousEntry.index, currentEntry.index, options);

    updatedChildren.push(
      ...createMatchedArrayItemNodes({
        config,
        previous: previousEntry.value,
        current: currentEntry.value,
        path: itemPath,
        movedRow,
        options,
      }),
    );
  }

  for (const [key, previousEntry] of previousItems) {
    if (currentItems.has(key)) {
      continue;
    }

    removedChildren.push(...createRemovedArrayItemNodes(config, previousEntry.value, [...path, String(key)], options));
  }

  return [
    ...sortHistoryNodesByChangeType(addedChildren),
    ...sortHistoryNodesByChangeType(updatedChildren),
    ...sortHistoryNodesByChangeType(removedChildren),
  ];
}

function createMatchedArrayItemNodes(args: {
  config: InternalArrayFieldConfig;
  previous: unknown;
  current: unknown;
  path: string[];
  movedRow: HistoryFieldRow | null;
  options: HistoryEngineOptions;
}): HistoryNode[] {
  const { config, previous, current, path, movedRow, options } = args;
  const item = config.item as InternalArrayItemConfig;

  if (item.kind === "object") {
    const group = createHistoryGroup(item.definition, previous, current, path, options);

    if (group == null) {
      return movedRow == null ? [] : [createMovedOnlyGroup(item, current, path, movedRow, options)];
    }

    return [
      {
        ...group,
        children: movedRow == null ? group.children : [movedRow, ...group.children],
      },
    ];
  }

  const nodes = createFieldNodes({
    config: item,
    previous,
    current,
    previousParent: previous,
    currentParent: current,
    path,
    options,
  });

  return movedRow == null ? nodes : [movedRow, ...nodes];
}

function createAddedArrayItemNodes(
  config: InternalArrayFieldConfig,
  current: unknown,
  path: string[],
  options: HistoryEngineOptions,
): HistoryNode[] {
  const item = config.item as InternalArrayItemConfig;

  if (item.kind === "object") {
    const group = createHistoryGroup(item.definition, undefined, current, path, options, "added");

    return group == null
      ? [
          {
            type: "added",
            path,
            label: item.definition.options.label,
            current: formatDefinitionValue(item.definition, current, path, "current"),
          },
        ]
      : [group];
  }

  return createFieldNodes({
    config: item,
    previous: undefined,
    current,
    previousParent: undefined,
    currentParent: current,
    path,
    options,
  });
}

function createRemovedArrayItemNodes(
  config: InternalArrayFieldConfig,
  previous: unknown,
  path: string[],
  options: HistoryEngineOptions,
): HistoryNode[] {
  const item = config.item as InternalArrayItemConfig;

  if (item.kind === "object") {
    const group = createHistoryGroup(item.definition, previous, undefined, path, options, "removed");

    return group == null
      ? [
          {
            type: "removed",
            path,
            label: item.definition.options.label,
            previous: formatDefinitionValue(item.definition, previous, path, "previous"),
          },
        ]
      : [group];
  }

  return createFieldNodes({
    config: item,
    previous,
    current: undefined,
    previousParent: previous,
    currentParent: undefined,
    path,
    options,
  });
}

function createMovedOnlyGroup(
  item: Extract<InternalArrayItemConfig, { kind: "object" }>,
  current: unknown,
  path: string[],
  movedRow: HistoryFieldRow,
  options: HistoryEngineOptions,
): HistoryGroupNode {
  return {
    type: "group",
    path,
    label: item.definition.options.label,
    value: formatDefinitionValue(item.definition, current, path, "current"),
    changeType: "updated",
    children: [movedRow],
  };
}

function createMovedRow(
  path: string[],
  previousIndex: number,
  currentIndex: number,
  options: HistoryEngineOptions,
): HistoryFieldRow {
  return {
    type: "moved",
    path: [...path, "$position"],
    label: options.positionLabel ?? DEFAULT_POSITION_LABEL,
    previous: createHistoryValue(previousIndex, String(previousIndex + 1)),
    current: createHistoryValue(currentIndex, String(currentIndex + 1)),
  };
}

function createArrayItemMap(
  config: InternalArrayFieldConfig,
  array: unknown[],
): Map<HistoryEntityKey, { value: unknown; index: number }> {
  const map = new Map<HistoryEntityKey, { value: unknown; index: number }>();

  array.forEach((value, index) => {
    const key = createArrayItemKey(config, value, index);
    if (map.has(key)) {
      throw new Error(`Duplicate history array identity "${String(key)}" at "${String(index)}".`);
    }
    map.set(key, { value, index });
  });

  return map;
}

function createArrayItemKey(config: InternalArrayFieldConfig, value: unknown, index: number): HistoryEntityKey {
  const item = config.item as InternalArrayItemConfig;

  if (item.kind === "object") {
    return item.definition.options.key(value);
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return stableStringify(value) ?? String(index);
}

function sortHistoryNodesByChangeType(nodes: HistoryNode[]): HistoryNode[] {
  return [...nodes].sort((left, right) => getHistoryNodeChangeOrder(left) - getHistoryNodeChangeOrder(right));
}

function resolveDefaultGroupChangeType(children: HistoryNode[]): HistoryGroupChangeType {
  const hasChangedChild = children.some(child => getHistoryNodeChangeType(child) !== "unchanged");

  return hasChangedChild ? "updated" : "unchanged";
}

function getHistoryNodeChangeType(node: HistoryNode): HistoryGroupChangeType {
  if (node.type === "group") {
    return node.changeType ?? resolveDefaultGroupChangeType(node.children);
  }

  switch (node.type) {
    case "added":
      return "added";

    case "removed":
      return "removed";

    case "updated":
    case "moved":
      return "updated";

    case "unchanged":
      return "unchanged";

    default:
      return "updated";
  }
}

function getHistoryNodeChangeOrder(node: HistoryNode): number {
  if (node.type === "group" && node.changeType != null) {
    return getHistoryChangeOrder(node.changeType);
  }

  if (node.type !== "group") {
    return getHistoryFieldRowChangeOrder(node);
  }

  if (node.children.length === 0) {
    return 1;
  }

  return Math.min(...node.children.map(getHistoryNodeChangeOrder));
}

function getHistoryChangeOrder(changeType: HistoryGroupChangeType): number {
  switch (changeType) {
    case "added":
      return 0;

    case "updated":
      return 1;

    case "removed":
      return 2;

    case "unchanged":
      return 3;

    default:
      return 1;
  }
}

function getHistoryFieldRowChangeOrder(row: HistoryFieldRow): number {
  switch (row.type) {
    case "added":
      return 0;

    case "updated":
    case "moved":
      return 1;

    case "removed":
      return 2;

    case "unchanged":
      return 3;

    default:
      return 1;
  }
}

function resolveDefaultFieldChange(previous: unknown, current: unknown): "added" | "removed" | "updated" | null {
  const previousEmpty = !isHistoryValuePresent(previous);
  const currentEmpty = !isHistoryValuePresent(current);

  if (previousEmpty && currentEmpty) {
    return null;
  }

  if (previousEmpty && !currentEmpty) {
    return "added";
  }

  if (!previousEmpty && currentEmpty) {
    return "removed";
  }

  if (areHistoryValuesEqual(previous, current)) {
    return null;
  }

  return "updated";
}

function getObjectFieldValue(value: unknown, fieldName: string): unknown {
  if (value == null || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[fieldName];
}

function formatFieldValue(args: {
  config: InternalAtomicFieldConfig;
  value: unknown;
  parent: unknown;
  side: "previous" | "current";
  path: string[];
  options: HistoryEngineOptions;
}): HistoryValue {
  const { config, value, parent, side, path } = args;
  return formatHistoryValue(value, config.format, { parent, side, path });
}

function formatArrayValue(
  config: InternalArrayFieldConfig,
  value: unknown[],
  parent: unknown,
  path: string[],
  side: "previous" | "current",
): HistoryValue | undefined {
  if (config.format == null) return undefined;
  return formatHistoryValue(value, config.format, { parent, side, path });
}

function formatDefinitionValue(
  definition: InternalHistoryDefinition,
  value: unknown,
  path: string[],
  side: "previous" | "current",
): HistoryValue {
  if (definition.options.format == null) {
    return createHistoryValue(value, definition.options.label);
  }

  return formatHistoryValue(value, definition.options.format, { parent: value, side, path });
}

function createHistoryValue(raw: unknown, formatted: string): HistoryValue {
  return { raw, formatted };
}
