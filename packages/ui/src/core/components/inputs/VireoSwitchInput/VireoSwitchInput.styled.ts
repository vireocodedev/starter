import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import {
  FormControl,
  FormHelperText,
  type FormHelperTextProps,
  Switch,
  type SwitchProps,
  Typography,
  type TypographyProps,
  type FormControlProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_SWITCH_INPUT_NAME } from "./VireoSwitchInput.identity";
import type { VireoSwitchInputOwnerState } from "./VireoSwitchInput.types";
type Owner = StyledSlotProps<VireoSwitchInputOwnerState>;
export const VireoSwitchInputRoot = styled(FormControl, {
  name: VIREO_SWITCH_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({}) as unknown as StyledSlotComponent<FormControlProps, VireoSwitchInputOwnerState>;
export const VireoSwitchInputControl: StyledSlotComponent<SwitchProps, VireoSwitchInputOwnerState> = styled(Switch, {
  name: VIREO_SWITCH_INPUT_NAME,
  slot: "Control",
  overridesResolver: (_p, s) => s.control,
})<Owner>({});
export const VireoSwitchInputLabel: StyledSlotComponent<TypographyProps, VireoSwitchInputOwnerState> = styled(
  Typography,
  { name: VIREO_SWITCH_INPUT_NAME, slot: "Label", overridesResolver: (_p, s) => s.label },
)<Owner>({ fontWeight: 600 });
export const VireoSwitchInputHelperText: StyledSlotComponent<FormHelperTextProps, VireoSwitchInputOwnerState> = styled(
  FormHelperText,
  { name: VIREO_SWITCH_INPUT_NAME, slot: "HelperText", overridesResolver: (_p, s) => s.helperText },
)<Owner>({});
