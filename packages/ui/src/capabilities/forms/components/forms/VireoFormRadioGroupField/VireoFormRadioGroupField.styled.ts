import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
  type FormControlLabelProps,
  type FormControlProps,
  type FormHelperTextProps,
  type RadioGroupProps,
  type RadioProps,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_RADIO_GROUP_FIELD_NAME } from "./VireoFormRadioGroupField.identity";
import { type VireoFormRadioGroupFieldOwnerState } from "./VireoFormRadioGroupField.types";

type VireoFormRadioGroupFieldStyledSlotProps = StyledSlotProps<VireoFormRadioGroupFieldOwnerState>;
type VireoFormRadioGroupFieldStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormRadioGroupFieldOwnerState
>;

export const VireoFormRadioGroupFieldRoot: VireoFormRadioGroupFieldStyledSlotComponent<FormControlProps> = styled(
  FormControl,
  {
    name: VIREO_FORM_RADIO_GROUP_FIELD_NAME,
    slot: "Root",
    overridesResolver: (props, styles) => [
      styles.root,
      props.ownerState.dirty && styles.dirty,
      props.ownerState.touched && styles.touched,
      props.ownerState.invalid && styles.invalid,
      props.ownerState.errorVisible && styles.errorVisible,
      props.ownerState.validating && styles.validating,
      props.ownerState.submitting && styles.submitting,
      props.ownerState.disabled && styles.disabled,
      props.ownerState.row && styles.row,
      props.ownerState.hasValue && styles.hasValue,
    ],
  },
)<VireoFormRadioGroupFieldStyledSlotProps>({});

export const VireoFormRadioGroupFieldRadioGroup: VireoFormRadioGroupFieldStyledSlotComponent<RadioGroupProps> = styled(
  RadioGroup,
  {
    name: VIREO_FORM_RADIO_GROUP_FIELD_NAME,
    slot: "RadioGroup",
    overridesResolver: (_props, styles) => styles.radioGroup,
  },
)<VireoFormRadioGroupFieldStyledSlotProps>({});

export const VireoFormRadioGroupFieldFormControlLabel: VireoFormRadioGroupFieldStyledSlotComponent<FormControlLabelProps> =
  styled(FormControlLabel, {
    name: VIREO_FORM_RADIO_GROUP_FIELD_NAME,
    slot: "FormControlLabel",
    overridesResolver: (_props, styles) => styles.formControlLabel,
  })<VireoFormRadioGroupFieldStyledSlotProps>({});

export const VireoFormRadioGroupFieldRadio: VireoFormRadioGroupFieldStyledSlotComponent<RadioProps> = styled(Radio, {
  name: VIREO_FORM_RADIO_GROUP_FIELD_NAME,
  slot: "Radio",
  overridesResolver: (_props, styles) => styles.radio,
})<VireoFormRadioGroupFieldStyledSlotProps>({});

export const VireoFormRadioGroupFieldOptionLabel: VireoFormRadioGroupFieldStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FORM_RADIO_GROUP_FIELD_NAME,
    slot: "OptionLabel",
    overridesResolver: (_props, styles) => styles.optionLabel,
  },
)<VireoFormRadioGroupFieldStyledSlotProps>({});

export const VireoFormRadioGroupFieldFormHelperText: VireoFormRadioGroupFieldStyledSlotComponent<FormHelperTextProps> =
  styled(FormHelperText, {
    name: VIREO_FORM_RADIO_GROUP_FIELD_NAME,
    slot: "FormHelperText",
    overridesResolver: (_props, styles) => styles.formHelperText,
  })<VireoFormRadioGroupFieldStyledSlotProps>(({ theme }) => ({
    marginInline: theme.spacing(1.75),
  }));
