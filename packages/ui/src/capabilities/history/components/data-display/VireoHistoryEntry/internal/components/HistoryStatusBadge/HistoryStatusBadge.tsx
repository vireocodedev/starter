import type { VireoHistoryEntryLabels } from "@/capabilities/history/components/data-display/VireoHistoryEntry/VireoHistoryEntry.types";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import { Box, Tooltip } from "@mui/material";

export type HistoryStatus = "added" | "removed" | "updated" | "moved" | "unchanged";

function getStatusLabel(status: HistoryStatus, labels: VireoHistoryEntryLabels): string {
  return labels[status];
}

function HistoryStatusIcon({ status }: { status: HistoryStatus }): React.ReactElement {
  const iconProps = { "aria-hidden": true, focusable: false, fontSize: "inherit" as const };

  switch (status) {
    case "added":
      return <AddRoundedIcon {...iconProps} />;
    case "removed":
      return <RemoveRoundedIcon {...iconProps} />;
    case "moved":
      return <SwapVertRoundedIcon {...iconProps} />;
    case "unchanged":
      return <HorizontalRuleRoundedIcon {...iconProps} />;
    default:
      return <EditRoundedIcon {...iconProps} />;
  }
}

export function HistoryStatusBadge({
  focusable = true,
  status,
  labels,
}: {
  focusable?: boolean;
  status: HistoryStatus;
  labels: VireoHistoryEntryLabels;
}): React.ReactElement {
  const label = getStatusLabel(status, labels);

  return (
    <Tooltip title={label} arrow>
      <Box
        component="span"
        className="VireoHistoryEntry-statusBadge"
        data-change-type={status}
        role="img"
        aria-label={label}
        tabIndex={focusable ? 0 : undefined}
      >
        <HistoryStatusIcon status={status} />
      </Box>
    </Tooltip>
  );
}
