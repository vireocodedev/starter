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
import { createHistoryNodes, type AnyHistoryDefinition, type HistoryNode } from "@vireocodedev/starter-history";

const DEFAULT_LABELS = {
  expandSection: "Expand section",
  collapseSection: "Collapse section",
  showUnchanged: "Show unchanged",
  hideUnchanged: "Hide unchanged",
  showMore: "Show more",
  showLess: "Show less",
} as const;

function containsChangedHistoryNode(node: HistoryNode): boolean {
  if (node.type === "group") return node.children.some(containsChangedHistoryNode);
  return node.type !== "unchanged";
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
    showRootEntityLabel = false,
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

  const ownerState: VireoHistoryEntryOwnerState = {
    defaultExpandedDepth,
    defaultShowUnchanged,
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
          node={node}
          rootMeta={rootMeta}
          showRootEntityLabel={showRootEntityLabel}
          defaultExpandedDepth={defaultExpandedDepth}
          defaultShowUnchanged={defaultShowUnchanged}
          labels={labels}
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
