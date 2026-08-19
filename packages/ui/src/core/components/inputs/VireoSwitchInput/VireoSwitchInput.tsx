import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { FormControlLabel, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { getVireoSwitchInputUtilityClass, type VireoSwitchInputClassKey } from "./VireoSwitchInput.classes";
import { VIREO_SWITCH_INPUT_NAME, type VireoSwitchInputSlotName } from "./VireoSwitchInput.identity";
import {
  VireoSwitchInputControl,
  VireoSwitchInputHelperText,
  VireoSwitchInputLabel,
  VireoSwitchInputRoot,
} from "./VireoSwitchInput.styled";
import type { VireoSwitchInputProps } from "./VireoSwitchInput.types";
function useUtilityClasses(classes?: VireoSwitchInputProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      control: ["control"],
      label: ["label"],
      helperText: ["helperText"],
    } as const satisfies UtilityClassSlotMap<VireoSwitchInputSlotName, VireoSwitchInputClassKey>,
    getVireoSwitchInputUtilityClass,
    classes,
  );
}
/** Controlled boolean switch with integrated label, validation state, and helper text. */
export const VireoSwitchInput = React.forwardRef<HTMLButtonElement, VireoSwitchInputProps>(
  function VireoSwitchInput(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: VIREO_SWITCH_INPUT_NAME });
    const {
      className,
      classes: classesProp,
      disabled = false,
      error = false,
      helperText,
      label,
      onChange,
      slotProps = {},
      slots = {},
      style,
      sx,
      value,
      ...other
    } = props;
    const ownerState = { checked: value ?? false, disabled, error };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const control = resolveSlotProps(slotProps.control, ownerState);
    const labelProps = resolveSlotProps(slotProps.label, ownerState);
    const helper = resolveSlotProps(slotProps.helperText, ownerState);
    const { className: rootClassName, style: rootStyle, sx: rootSx, ...rootOther } = root;
    const { className: controlClassName, ...controlOther } = control;
    const { className: labelClassName, ...labelOther } = labelProps;
    const { className: helperClassName, ...helperOther } = helper;
    const Control = slots.control ?? VireoSwitchInputControl;
    const Label = slots.label ?? VireoSwitchInputLabel;
    const HelperText = slots.helperText ?? VireoSwitchInputHelperText;
    return (
      <VireoSwitchInputRoot
        {...other}
        {...rootOther}
        as={slots.root}
        ownerState={ownerState}
        error={error}
        disabled={disabled}
        variant="standard"
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      >
        <FormControlLabel
          sx={{ m: 0, gap: 1 }}
          control={
            <Control
              {...controlOther}
              ref={ref}
              ownerState={ownerState}
              className={joinClassNames(classes.control, controlClassName)}
              checked={ownerState.checked}
              disabled={disabled}
              onChange={(_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => onChange(checked)}
            />
          }
          label={
            label === undefined ? (
              ""
            ) : (
              <Label
                {...labelOther}
                ownerState={ownerState}
                component="span"
                className={joinClassNames(classes.label, labelClassName)}
              >
                {label}
              </Label>
            )
          }
        />
        {helperText !== undefined && (
          <HelperText
            {...helperOther}
            ownerState={ownerState}
            className={joinClassNames(classes.helperText, helperClassName)}
          >
            {helperText}
          </HelperText>
        )}
      </VireoSwitchInputRoot>
    );
  },
);
VireoSwitchInput.displayName = VIREO_SWITCH_INPUT_NAME;
