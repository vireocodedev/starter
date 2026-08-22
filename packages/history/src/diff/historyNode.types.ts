import type { HistoryPath } from "../definitions/historyDefinition.types";

export type HistoryValue = {
  raw: unknown;
  formatted: string;
};

export type HistoryFieldRow =
  | {
      type: "removed";
      path: HistoryPath;
      label: string;
      previous: HistoryValue;
    }
  | {
      type: "updated";
      path: HistoryPath;
      label: string;
      previous: HistoryValue;
      current: HistoryValue;
    }
  | {
      type: "added";
      path: HistoryPath;
      label: string;
      current: HistoryValue;
    }
  | {
      type: "moved";
      path: HistoryPath;
      label: string;
      previous: HistoryValue;
      current: HistoryValue;
    }
  | {
      type: "unchanged";
      path: HistoryPath;
      label: string;
      current: HistoryValue;
    };

export type HistoryGroupChangeType = "added" | "updated" | "removed" | "unchanged";

export type HistoryGroupNode = {
  type: "group";
  path: HistoryPath;
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
