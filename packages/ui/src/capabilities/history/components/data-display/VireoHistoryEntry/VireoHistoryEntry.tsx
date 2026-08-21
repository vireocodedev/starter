import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoHistoryEntryClassKey, getVireoHistoryEntryUtilityClass } from "./VireoHistoryEntry.classes";
import { VIREO_HISTORY_ENTRY_NAME, type VireoHistoryEntrySlotName } from "./VireoHistoryEntry.identity";
import { VireoHistoryEntryRoot } from "./VireoHistoryEntry.styled";
import { type VireoHistoryEntryOwnerState, type VireoHistoryEntryProps } from "./VireoHistoryEntry.types";
import { HistoryNodeView } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/components/HistoryNodeView/HistoryNodeView";
import type { HistoryEntryDisclosure } from "@/capabilities/history/components/data-display/VireoHistoryEntry/internal/types/historyEntry.types";
import { createHistoryNodes, type AnyHistoryDefinition, type HistoryNode } from "@vireocodedev/starter-history";

const DEFAULT_LABELS = {
  expandSection: "Expand section",
  collapseSection: "Collapse section",
  showUnchanged: "Show unchanged",
  hideUnchanged: "Hide unchanged",
  showMore: "Show more",
  showLess: "Show less",
  added: "Added",
  removed: "Removed",
  updated: "Updated",
  moved: "Moved",
  unchanged: "Unchanged",
  field: "Field",
  previous: "Previous",
  current: "Current",
  value: "Value",
  notPresent: "Not present",
  changes: (count: number) => `${count} ${count === 1 ? "change" : "changes"}`,
} as const;

function containsChangedHistoryNode(node: HistoryNode): boolean {
  if (node.type === "group") return node.children.some(containsChangedHistoryNode);
  return node.type !== "unchanged";
}

function containsUnchangedHistoryNode(node: HistoryNode): boolean {
  if (node.type === "group") return node.children.some(containsUnchangedHistoryNode);
  return node.type === "unchanged";
}

function getPathKey(path: readonly string[]): string {
  return path.length === 0 ? "$root" : path.join(".");
}

function useUtilityClasses(_ownerState: VireoHistoryEntryOwnerState, classes?: VireoHistoryEntryProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoHistoryEntrySlotName, VireoHistoryEntryClassKey>,
    getVireoHistoryEntryUtilityClass,
    classes,
  );
}

function VireoHistoryEntryImpl<TDefinition extends AnyHistoryDefinition>(
  inProps: VireoHistoryEntryProps<TDefinition>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_HISTORY_ENTRY_NAME });
  const {
    className,
    classes: classesProp,
    current,
    defaultExpandedDepth = 3,
    defaultShowUnchanged = false,
    definition,
    emptyValue,
    labels: labelsProp,
    previous,
    rootMeta,
    showRootEntityLabel = true,
    slotProps = {},
    slots = {},
    style,
    sx,
    ...other
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const nodes = React.useMemo(
    () => createHistoryNodes(definition, previous, current, { emptyValue, showUnchanged: true }),
    [current, definition, emptyValue, previous],
  );

  const hasChanges = nodes.some(containsChangedHistoryNode);
  const hasUnchanged = nodes.some(containsUnchangedHistoryNode);
  const entryIdentity = React.useMemo(() => {
    const snapshot = current ?? previous;
    if (snapshot == null) return `${definition.options.label}:empty`;
    return `${definition.options.label}:${String(definition.options.key(snapshot))}`;
  }, [current, definition, previous]);
  const [expandedByPath, setExpandedByPath] = React.useState<Record<string, boolean>>({});
  const [showUnchanged, setShowUnchanged] = React.useState(defaultShowUnchanged);

  React.useEffect(() => {
    setExpandedByPath({});
    setShowUnchanged(defaultShowUnchanged);
  }, [defaultShowUnchanged, entryIdentity]);

  const isExpanded = React.useCallback(
    (path: readonly string[], depth: number) => expandedByPath[getPathKey(path)] ?? depth <= defaultExpandedDepth,
    [defaultExpandedDepth, expandedByPath],
  );
  const onToggleExpanded = React.useCallback(
    (path: readonly string[], depth: number) => {
      const key = getPathKey(path);
      setExpandedByPath(currentState => ({
        ...currentState,
        [key]: !(currentState[key] ?? depth <= defaultExpandedDepth),
      }));
    },
    [defaultExpandedDepth],
  );
  const rootNode = nodes[0];
  const expanded = rootNode?.type === "group" ? isExpanded(rootNode.path, 1) : true;
  const disclosure: HistoryEntryDisclosure = {
    defaultExpandedDepth,
    isExpanded,
    labels,
    onToggleExpanded,
    onToggleShowUnchanged: () => setShowUnchanged(currentValue => !currentValue),
    showUnchanged,
  };

  const ownerState: VireoHistoryEntryOwnerState = {
    defaultExpandedDepth,
    defaultShowUnchanged,
    expanded,
    hasUnchanged,
    hasRootMeta: rootMeta != null,
    showRootEntityLabel,
  };
  const classes = useUtilityClasses(ownerState, classesProp);

  const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
  const {
    className: rootSlotClassName,
    ref: rootSlotRef,
    style: rootSlotStyle,
    sx: rootSlotSx,
    ...rootSlotOther
  } = resolvedRootSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);

  if (nodes.length === 0 || (!hasChanges && !defaultShowUnchanged)) return null;

  return (
    <VireoHistoryEntryRoot
      {...other}
      {...rootSlotOther}
      as={slots.root ?? "div"}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootSlotClassName)}
      style={{ ...style, ...rootSlotStyle }}
      sx={mergeSx(sx, rootSlotSx)}
    >
      {nodes.map(node => (
        <HistoryNodeView
          key={node.path.join(".") || "$root"}
          disclosure={disclosure}
          hasUnchanged={hasUnchanged}
          node={node}
          rootMeta={rootMeta}
          showRootEntityLabel={showRootEntityLabel}
        />
      ))}
    </VireoHistoryEntryRoot>
  );
}

type VireoHistoryEntryComponent = {
  <TDefinition extends AnyHistoryDefinition>(
    props: VireoHistoryEntryProps<TDefinition> & React.RefAttributes<HTMLDivElement>,
  ): React.ReactElement | null;
  displayName?: string;
};

/** Presents one typed entity change as an expandable, nested, read-only history entry. */
export const VireoHistoryEntry = React.forwardRef(VireoHistoryEntryImpl) as VireoHistoryEntryComponent;

VireoHistoryEntry.displayName = VIREO_HISTORY_ENTRY_NAME;
