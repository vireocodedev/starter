import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  FormControl,
  FormHelperText,
  IconButton,
  OutlinedInput,
  type FormControlProps,
  type FormHelperTextProps,
  type IconButtonProps,
  type OutlinedInputProps,
  type SvgIconProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_COUNTER_FIELD_NAME } from "./VireoFormCounterField.identity";
import type { VireoFormCounterFieldOwnerState } from "./VireoFormCounterField.types";

type StyledProps = StyledSlotProps<VireoFormCounterFieldOwnerState>;
type StyledComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormCounterFieldOwnerState>;

export const VireoFormCounterFieldRoot: StyledComponent<FormControlProps> = styled(FormControl, {
  name: VIREO_FORM_COUNTER_FIELD_NAME,
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
    props.ownerState.readOnly && styles.readOnly,
    props.ownerState.hasValue && styles.hasValue,
    props.ownerState.atMin && styles.atMin,
    props.ownerState.atMax && styles.atMax,
  ],
})<StyledProps>(({ ownerState }) => ({ minWidth: 0, ...(ownerState.fullWidth && { width: "100%" }) }));

export const VireoFormCounterFieldInput: StyledComponent<OutlinedInputProps> = styled(OutlinedInput, {
  name: VIREO_FORM_COUNTER_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})<StyledProps>(({ ownerState }) => ({
  minWidth: 0,
  ...(ownerState.fullWidth && { width: "100%" }),
  "& .MuiInputAdornment-root": { margin: 0, maxHeight: "none" },
}));

export const VireoFormCounterFieldDecrementButton: StyledComponent<IconButtonProps> = styled(IconButton, {
  name: VIREO_FORM_COUNTER_FIELD_NAME,
  slot: "DecrementButton",
  overridesResolver: (_props, styles) => styles.decrementButton,
})<StyledProps>(({ ownerState }) => ({
  flex: "0 0 auto",
  minHeight: ownerState.size === "small" ? 32 : 40,
  minWidth: ownerState.size === "small" ? 32 : 40,
}));

export const VireoFormCounterFieldDecrementIcon: StyledComponent<SvgIconProps> = styled(RemoveIcon, {
  name: VIREO_FORM_COUNTER_FIELD_NAME,
  slot: "DecrementIcon",
  overridesResolver: (_props, styles) => styles.decrementIcon,
})<StyledProps>({});

export const VireoFormCounterFieldHtmlInput: StyledComponent<React.ComponentPropsWithoutRef<"input">> = styled(
  "input",
  {
    name: VIREO_FORM_COUNTER_FIELD_NAME,
    slot: "HtmlInput",
    overridesResolver: (_props, styles) => styles.htmlInput,
  },
)<StyledProps>({
  appearance: "textfield",
  fontVariantNumeric: "tabular-nums",
  minWidth: 0,
  textAlign: "center",
});

export const VireoFormCounterFieldIncrementButton: StyledComponent<IconButtonProps> = styled(IconButton, {
  name: VIREO_FORM_COUNTER_FIELD_NAME,
  slot: "IncrementButton",
  overridesResolver: (_props, styles) => styles.incrementButton,
})<StyledProps>(({ ownerState }) => ({
  flex: "0 0 auto",
  minHeight: ownerState.size === "small" ? 32 : 40,
  minWidth: ownerState.size === "small" ? 32 : 40,
}));

export const VireoFormCounterFieldIncrementIcon: StyledComponent<SvgIconProps> = styled(AddIcon, {
  name: VIREO_FORM_COUNTER_FIELD_NAME,
  slot: "IncrementIcon",
  overridesResolver: (_props, styles) => styles.incrementIcon,
})<StyledProps>({});

export const VireoFormCounterFieldFormHelperText: StyledComponent<FormHelperTextProps> = styled(FormHelperText, {
  name: VIREO_FORM_COUNTER_FIELD_NAME,
  slot: "FormHelperText",
  overridesResolver: (_props, styles) => styles.formHelperText,
})<StyledProps>(({ theme }) => ({ marginInline: theme.spacing(1.75) }));
