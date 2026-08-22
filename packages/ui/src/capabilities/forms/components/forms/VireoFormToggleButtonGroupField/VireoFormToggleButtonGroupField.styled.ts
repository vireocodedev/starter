import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  FormControl,
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
  type FormControlProps,
  type FormHelperTextProps,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME } from "./VireoFormToggleButtonGroupField.identity";
import type { VireoFormToggleButtonGroupFieldOwnerState } from "./VireoFormToggleButtonGroupField.types";

type StyledProps = StyledSlotProps<VireoFormToggleButtonGroupFieldOwnerState>;
type StyledComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormToggleButtonGroupFieldOwnerState>;

export const VireoFormToggleButtonGroupFieldRoot: StyledComponent<FormControlProps> = styled(FormControl, {
  name: VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
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
    props.ownerState.multiple && styles.multiple,
  ],
})<StyledProps>(({ ownerState }) => ({
  minWidth: 0,
  ...(ownerState.fullWidth && { width: "100%" }),
}));

export const VireoFormToggleButtonGroupFieldToggleButtonGroup: StyledComponent<ToggleButtonGroupProps> = styled(
  ToggleButtonGroup,
  {
    name: VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
    slot: "ToggleButtonGroup",
    overridesResolver: (_props, styles) => styles.toggleButtonGroup,
  },
)<StyledProps>(({ ownerState, theme }) => ({
  minWidth: 0,
  flexWrap: "nowrap",
  ...(ownerState.fullWidth && { width: "100%" }),
  ...(ownerState.orientation === "vertical" && { alignItems: "stretch" }),
  ...(ownerState.errorVisible && { "& .MuiToggleButton-root": { borderColor: theme.palette.error.main } }),
}));

export const VireoFormToggleButtonGroupFieldToggleButton: StyledComponent<ToggleButtonProps> = styled(ToggleButton, {
  name: VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
  slot: "ToggleButton",
  overridesResolver: (_props, styles) => styles.toggleButton,
})<StyledProps>(({ ownerState }) => ({
  minWidth: 0,
  whiteSpace: "normal",
  ...(ownerState.fullWidth && {
    flex: "1 1 0",
    width: ownerState.orientation === "vertical" ? "100%" : undefined,
  }),
}));

export const VireoFormToggleButtonGroupFieldFormHelperText: StyledComponent<FormHelperTextProps> = styled(
  FormHelperText,
  {
    name: VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
    slot: "FormHelperText",
    overridesResolver: (_props, styles) => styles.formHelperText,
  },
)<StyledProps>(({ theme }) => ({ marginInline: theme.spacing(1.75) }));
