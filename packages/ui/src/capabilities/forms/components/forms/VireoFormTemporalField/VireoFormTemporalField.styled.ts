import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Close from "@mui/icons-material/Close";
import {
  Box,
  FormHelperText,
  IconButton,
  type BoxProps,
  type FormHelperTextProps,
  type IconButtonProps,
  type SvgIconProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  PickersFilledInput,
  PickersInput,
  PickersOutlinedInput,
  type PickersFilledInputProps,
  type PickersInputProps,
  type PickersOutlinedInputProps,
} from "@mui/x-date-pickers";
import { VIREO_FORM_TEMPORAL_FIELD_NAME } from "./VireoFormTemporalField.identity";
import { type VireoFormTemporalFieldOwnerState } from "./VireoFormTemporalField.types";

type VireoFormTemporalFieldStyledSlotProps = StyledSlotProps<VireoFormTemporalFieldOwnerState>;
type VireoFormTemporalFieldStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormTemporalFieldOwnerState
>;

export const VireoFormTemporalFieldRoot: VireoFormTemporalFieldStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_TEMPORAL_FIELD_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldOutlinedInput: VireoFormTemporalFieldStyledSlotComponent<PickersOutlinedInputProps> =
  styled(PickersOutlinedInput, {
    name: VIREO_FORM_TEMPORAL_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  })<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldFilledInput: VireoFormTemporalFieldStyledSlotComponent<PickersFilledInputProps> =
  styled(PickersFilledInput, {
    name: VIREO_FORM_TEMPORAL_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  })<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldStandardInput: VireoFormTemporalFieldStyledSlotComponent<PickersInputProps> = styled(
  PickersInput,
  {
    name: VIREO_FORM_TEMPORAL_FIELD_NAME,
    slot: "Input",
    overridesResolver: (_props, styles) => styles.input,
  },
)<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldFormHelperText: VireoFormTemporalFieldStyledSlotComponent<FormHelperTextProps> =
  styled(FormHelperText, {
    name: VIREO_FORM_TEMPORAL_FIELD_NAME,
    slot: "FormHelperText",
    overridesResolver: (_props, styles) => styles.formHelperText,
  })<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldOpenPickerButton: VireoFormTemporalFieldStyledSlotComponent<IconButtonProps> =
  styled(IconButton, {
    name: VIREO_FORM_TEMPORAL_FIELD_NAME,
    slot: "OpenPickerButton",
    overridesResolver: (_props, styles) => styles.openPickerButton,
  })<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldOpenPickerIcon: VireoFormTemporalFieldStyledSlotComponent<SvgIconProps> = styled(
  CalendarToday,
  {
    name: VIREO_FORM_TEMPORAL_FIELD_NAME,
    slot: "OpenPickerIcon",
    overridesResolver: (_props, styles) => styles.openPickerIcon,
  },
)<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldClearButton: VireoFormTemporalFieldStyledSlotComponent<IconButtonProps> = styled(
  IconButton,
  {
    name: VIREO_FORM_TEMPORAL_FIELD_NAME,
    slot: "ClearButton",
    overridesResolver: (_props, styles) => styles.clearButton,
  },
)<VireoFormTemporalFieldStyledSlotProps>({});

export const VireoFormTemporalFieldClearIcon: VireoFormTemporalFieldStyledSlotComponent<SvgIconProps> = styled(Close, {
  name: VIREO_FORM_TEMPORAL_FIELD_NAME,
  slot: "ClearIcon",
  overridesResolver: (_props, styles) => styles.clearIcon,
})<VireoFormTemporalFieldStyledSlotProps>({});
