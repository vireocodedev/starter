import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  type SelectProps,
  type FormControlProps,
  type FormHelperTextProps,
  type IconButtonProps,
  type InputLabelProps,
  type MenuItemProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_SELECT_INPUT_NAME } from "./VireoSelectInput.identity";
import type { VireoSelectInputOwnerState } from "./VireoSelectInput.types";
type P = StyledSlotProps<VireoSelectInputOwnerState>;
type C<T extends object> = StyledSlotComponent<T, VireoSelectInputOwnerState>;
type SelectSlotProps = Pick<SelectProps<unknown>, keyof SelectProps<unknown>>;
export const VireoSelectInputRoot: C<FormControlProps> = styled(FormControl, {
  name: VIREO_SELECT_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<P>({ width: "100%" });
export const VireoSelectInputLabel: C<InputLabelProps> = styled(InputLabel, {
  name: VIREO_SELECT_INPUT_NAME,
  slot: "Label",
  overridesResolver: (_p, s) => s.label,
})<P>({});
export const VireoSelectInputSelect: C<SelectSlotProps> = styled(Select, {
  name: VIREO_SELECT_INPUT_NAME,
  slot: "Select",
  overridesResolver: (_p, s) => s.select,
})<P>({});
export const VireoSelectInputOption: C<MenuItemProps> = styled(MenuItem, {
  name: VIREO_SELECT_INPUT_NAME,
  slot: "Option",
  overridesResolver: (_p, s) => s.option,
})<P>({});
export const VireoSelectInputOptionText: C<React.ComponentProps<typeof ListItemText>> = styled(ListItemText, {
  name: VIREO_SELECT_INPUT_NAME,
  slot: "OptionText",
  overridesResolver: (_p, s) => s.optionText,
})<P>({});
export const VireoSelectInputClearButton: C<IconButtonProps> = styled(IconButton, {
  name: VIREO_SELECT_INPUT_NAME,
  slot: "ClearButton",
  overridesResolver: (_p, s) => s.clearButton,
})<P>({ position: "absolute", right: 32 });
export const VireoSelectInputHelperText: C<FormHelperTextProps> = styled(FormHelperText, {
  name: VIREO_SELECT_INPUT_NAME,
  slot: "HelperText",
  overridesResolver: (_p, s) => s.helperText,
})<P>({});
