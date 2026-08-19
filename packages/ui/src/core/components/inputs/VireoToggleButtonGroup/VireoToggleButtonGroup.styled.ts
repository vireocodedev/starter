import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import {
  FormControl,
  FormHelperText,
  type FormControlProps,
  type FormHelperTextProps,
  IconButton,
  type IconButtonProps,
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_TOGGLE_BUTTON_GROUP_NAME } from "./VireoToggleButtonGroup.identity";
import type { VireoToggleButtonGroupOwnerState } from "./VireoToggleButtonGroup.types";
type Owner = StyledSlotProps<VireoToggleButtonGroupOwnerState>;
export const VireoToggleButtonGroupRoot = styled(FormControl, {
  name: VIREO_TOGGLE_BUTTON_GROUP_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({}) as unknown as StyledSlotComponent<FormControlProps, VireoToggleButtonGroupOwnerState>;
export const VireoToggleButtonGroupGroup: StyledSlotComponent<
  ToggleButtonGroupProps,
  VireoToggleButtonGroupOwnerState
> = styled(ToggleButtonGroup, {
  name: VIREO_TOGGLE_BUTTON_GROUP_NAME,
  slot: "Group",
  overridesResolver: (_p, s) => s.group,
})<Owner>({ flexWrap: "wrap" });
export const VireoToggleButtonGroupOption: StyledSlotComponent<ToggleButtonProps, VireoToggleButtonGroupOwnerState> =
  styled(ToggleButton, {
    name: VIREO_TOGGLE_BUTTON_GROUP_NAME,
    slot: "Option",
    overridesResolver: (_p, s) => s.option,
  })<Owner>({});
export const VireoToggleButtonGroupClearButton: StyledSlotComponent<IconButtonProps, VireoToggleButtonGroupOwnerState> =
  styled(IconButton, {
    name: VIREO_TOGGLE_BUTTON_GROUP_NAME,
    slot: "ClearButton",
    overridesResolver: (_p, s) => s.clearButton,
  })<Owner>({ marginLeft: 8 });
export const VireoToggleButtonGroupHelperText: StyledSlotComponent<
  FormHelperTextProps,
  VireoToggleButtonGroupOwnerState
> = styled(FormHelperText, {
  name: VIREO_TOGGLE_BUTTON_GROUP_NAME,
  slot: "HelperText",
  overridesResolver: (_p, s) => s.helperText,
})<Owner>({});
