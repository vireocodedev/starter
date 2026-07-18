import { HistoryNodeView } from "@/history/components/HistoryNodeView";
import { createHistoryNodes, type HistoryDefinition } from "@vireocodedev/starter-history";

export type HistoryEntryCardProps<TDefinition extends HistoryDefinition<unknown>> = {
  definition: TDefinition;
  previous: unknown;
  current: unknown;
  emptyValue?: React.ReactNode;

  rootMeta?: React.ReactNode;
  showRootEntityLabel?: boolean;
  defaultShowUnchanged?: boolean;

  defaultExpandedDepth?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HistoryEntryCard(props: HistoryEntryCardProps<any>): React.ReactElement | null {
  const nodes = createHistoryNodes(props.definition, props.previous, props.current, {
    emptyValue: props.emptyValue,
    showUnchanged: true,
  });

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="history" style={{ backgroundColor: "var(--mui-palette-grey-100)" }}>
      {nodes.map(node => (
        <HistoryNodeView
          key={node.path.join(".") || "$root"}
          node={node}
          rootMeta={props.rootMeta}
          showRootEntityLabel={props.showRootEntityLabel ?? false}
          defaultExpandedDepth={props.defaultExpandedDepth ?? 3}
          defaultShowUnchanged={props.defaultShowUnchanged ?? false}
        />
      ))}
    </div>
  );
}
