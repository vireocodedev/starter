import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_STOPWATCH_NAME } from "./VireoStopwatch.identity";
import { type VireoStopwatchOwnerState } from "./VireoStopwatch.types";

type VireoStopwatchStyledSlotProps = StyledSlotProps<VireoStopwatchOwnerState>;
type VireoStopwatchStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoStopwatchOwnerState>;

export const VireoStopwatchRoot: VireoStopwatchStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_STOPWATCH_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoStopwatchStyledSlotProps>({
  display: "inline-block",
  fontFamily: '"Fira Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
  fontSize: "1.5ch",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
});
