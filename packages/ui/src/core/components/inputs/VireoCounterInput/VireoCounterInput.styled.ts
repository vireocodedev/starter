import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import { IconButton, type IconButtonProps, TextField, type TextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_COUNTER_INPUT_NAME } from "./VireoCounterInput.identity";
import type { VireoCounterInputOwnerState } from "./VireoCounterInput.types";
type Owner = StyledSlotProps<VireoCounterInputOwnerState>;
export const VireoCounterInputRoot = styled(TextField, {
  name: VIREO_COUNTER_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({ "& input": { textAlign: "center" } }) as unknown as StyledSlotComponent<
  TextFieldProps,
  VireoCounterInputOwnerState
>;
export const VireoCounterInputDecrementButton: StyledSlotComponent<IconButtonProps, VireoCounterInputOwnerState> =
  styled(IconButton, {
    name: VIREO_COUNTER_INPUT_NAME,
    slot: "DecrementButton",
    overridesResolver: (_p, s) => s.decrementButton,
  })<Owner>({});
export const VireoCounterInputIncrementButton: StyledSlotComponent<IconButtonProps, VireoCounterInputOwnerState> =
  styled(IconButton, {
    name: VIREO_COUNTER_INPUT_NAME,
    slot: "IncrementButton",
    overridesResolver: (_p, s) => s.incrementButton,
  })<Owner>({});
