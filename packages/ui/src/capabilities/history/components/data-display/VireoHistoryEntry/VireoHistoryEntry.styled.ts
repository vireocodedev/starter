import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_HISTORY_ENTRY_NAME } from "./VireoHistoryEntry.identity";
import { type VireoHistoryEntryOwnerState } from "./VireoHistoryEntry.types";

type VireoHistoryEntryStyledSlotProps = StyledSlotProps<VireoHistoryEntryOwnerState>;
type VireoHistoryEntryStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoHistoryEntryOwnerState
>;

export const VireoHistoryEntryRoot: VireoHistoryEntryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_HISTORY_ENTRY_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoHistoryEntryStyledSlotProps>(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(1),
  minWidth: 0,
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
}));
