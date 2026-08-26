import type { VireoHistoryEntryLabels } from "@/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.types";
import { VireoSkeleton } from "@/core/public";

function LoadingLine({ visible, width }: { visible: boolean; width: string | number }) {
  return (
    <VireoSkeleton height={16} variant="rounded" width={width} sx={{ visibility: visible ? "visible" : "hidden" }} />
  );
}

function LoadingRow({ index, visible }: { index: number; visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="VireoHistoryEntry-fieldRow"
      data-history-entry-loading-row={index}
      data-status="updated"
    >
      <div className="VireoHistoryEntry-statusCell">
        <VireoSkeleton height={22} variant="circular" width={22} sx={{ visibility: visible ? "visible" : "hidden" }} />
      </div>
      <div className="VireoHistoryEntry-fieldLabel">
        <LoadingLine visible={visible} width={index === 0 ? "58%" : "72%"} />
      </div>
      <div className="VireoHistoryEntry-valueBlock" data-placement="previous">
        <LoadingLine visible={visible} width={index === 0 ? "76%" : "62%"} />
      </div>
      <span className="VireoHistoryEntry-arrow">→</span>
      <div className="VireoHistoryEntry-valueBlock" data-placement="current">
        <LoadingLine visible={visible} width={index === 0 ? "64%" : "84%"} />
      </div>
    </div>
  );
}

export function HistoryEntryLoadingView({ labels, visible }: { labels: VireoHistoryEntryLabels; visible: boolean }) {
  return (
    <div className="VireoHistoryEntry-rootGroup" data-expanded data-history-entry-loading>
      <div className="VireoHistoryEntry-rootHeader">
        <div className="VireoHistoryEntry-rootSummaryButton" aria-hidden="true">
          <VireoSkeleton
            height={22}
            variant="circular"
            width={22}
            sx={{ flex: "0 0 auto", visibility: visible ? "visible" : "hidden" }}
          />
          <span className="VireoHistoryEntry-summaryText">
            <LoadingLine visible={visible} width={180} />
            <LoadingLine visible={visible} width={240} />
          </span>
        </div>
      </div>
      <div className="VireoHistoryEntry-expandedBody">
        <div className="VireoHistoryEntry-columnHeadings" aria-hidden="true">
          <span>{labels.field}</span>
          <span>{labels.previous}</span>
          <span>{labels.current}</span>
        </div>
        <LoadingRow index={0} visible={visible} />
        <LoadingRow index={1} visible={visible} />
      </div>
    </div>
  );
}
