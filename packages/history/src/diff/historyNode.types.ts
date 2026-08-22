export type HistoryValue = {
  raw: unknown;
  formatted: string;
};

export type HistoryFieldRow =
  | {
      type: "removed";
      path: readonly string[];
      label: string;
      previous: HistoryValue;
    }
  | {
      type: "updated";
      path: readonly string[];
      label: string;
      previous: HistoryValue;
      current: HistoryValue;
    }
  | {
      type: "added";
      path: readonly string[];
      label: string;
      current: HistoryValue;
    }
  | {
      type: "moved";
      path: readonly string[];
      label: string;
      previous: HistoryValue;
      current: HistoryValue;
    }
  | {
      type: "unchanged";
      path: readonly string[];
      label: string;
      current: HistoryValue;
    };

export type HistoryGroupChangeType = "added" | "updated" | "removed" | "unchanged";

export type HistoryGroupNode = {
  type: "group";
  path: readonly string[];
  label: string;
  value?: HistoryValue;
  changeType: HistoryGroupChangeType;
  children: HistoryNode[];
};

export type HistoryNode = HistoryFieldRow | HistoryGroupNode;

export type HistoryEngineOptions = {
  positionLabel?: string;
  showUnchanged?: boolean;
};
