import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  type FormControlProps,
  type FormHelperTextProps,
  type InputLabelProps,
  type MenuItemProps,
  type SelectProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_SELECT_MULTIPLE_INPUT_NAME } from "./VireoSelectMultipleInput.identity";
import type { VireoSelectMultipleInputOwnerState } from "./VireoSelectMultipleInput.types";
type P = StyledSlotProps<VireoSelectMultipleInputOwnerState>;
type C<T extends object> = StyledSlotComponent<T, VireoSelectMultipleInputOwnerState>;
type SelectSlotProps = Pick<SelectProps<unknown>, keyof SelectProps<unknown>>;
export const VireoSelectMultipleInputRoot: C<FormControlProps> = styled(FormControl, {
  name: VIREO_SELECT_MULTIPLE_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<P>({ width: "100%" });
export const VireoSelectMultipleInputLabel: C<InputLabelProps> = styled(InputLabel, {
  name: VIREO_SELECT_MULTIPLE_INPUT_NAME,
  slot: "Label",
  overridesResolver: (_p, s) => s.label,
})<P>({});
export const VireoSelectMultipleInputSelect: C<SelectSlotProps> = styled(Select, {
  name: VIREO_SELECT_MULTIPLE_INPUT_NAME,
  slot: "Select",
  overridesResolver: (_p, s) => s.select,
})<P>({});
export const VireoSelectMultipleInputOption: C<MenuItemProps> = styled(MenuItem, {
  name: VIREO_SELECT_MULTIPLE_INPUT_NAME,
  slot: "Option",
  overridesResolver: (_p, s) => s.option,
})<P>({});
export const VireoSelectMultipleInputOptionText: C<React.ComponentProps<typeof ListItemText>> = styled(ListItemText, {
  name: VIREO_SELECT_MULTIPLE_INPUT_NAME,
  slot: "OptionText",
  overridesResolver: (_p, s) => s.optionText,
})<P>({});
export const VireoSelectMultipleInputHelperText: C<FormHelperTextProps> = styled(FormHelperText, {
  name: VIREO_SELECT_MULTIPLE_INPUT_NAME,
  slot: "HelperText",
  overridesResolver: (_p, s) => s.helperText,
})<P>({});
