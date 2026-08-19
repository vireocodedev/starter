import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import Close from "@mui/icons-material/Close";
import {
  InputAdornment,
  OutlinedInput,
  Typography,
  unstable_composeClasses as composeClasses,
  type SelectChangeEvent,
} from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { getVireoSelectInputUtilityClass, type VireoSelectInputClassKey } from "./VireoSelectInput.classes";
import { VIREO_SELECT_INPUT_NAME, type VireoSelectInputSlotName } from "./VireoSelectInput.identity";
import {
  VireoSelectInputClearButton,
  VireoSelectInputHelperText,
  VireoSelectInputLabel,
  VireoSelectInputOption,
  VireoSelectInputOptionText,
  VireoSelectInputRoot,
  VireoSelectInputSelect,
} from "./VireoSelectInput.styled";
import type { VireoSelectInputProps } from "./VireoSelectInput.types";
function useUtilityClasses(classes?: Partial<Record<VireoSelectInputClassKey, string>>) {
  return composeClasses(
    {
      root: ["root"],
      label: ["label"],
      select: ["select"],
      option: ["option"],
      optionText: ["optionText"],
      clearButton: ["clearButton"],
      helperText: ["helperText"],
    } as const satisfies UtilityClassSlotMap<VireoSelectInputSlotName, VireoSelectInputClassKey>,
    getVireoSelectInputUtilityClass,
    classes,
  );
}
function VireoSelectInputImpl<TOption, TValue extends string | number>(
  inProps: VireoSelectInputProps<TOption, TValue>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_SELECT_INPUT_NAME });
  const {
    className,
    classes: classesProp,
    clearLabel = "Clear selection",
    disabled = false,
    disableClearable = false,
    error = false,
    getOptionValue,
    helperText,
    inputRef,
    label,
    onChange,
    options,
    placeholder,
    renderOption,
    slotProps = {},
    slots = {},
    style,
    sx,
    value,
    ...other
  } = props as VireoSelectInputProps<TOption, TValue> & {
    className?: string;
    style?: React.CSSProperties;
    sx?: VireoSelectInputProps<TOption, TValue>["sx"];
  };
  const ownerState = { disabled, error, hasValue: value !== null };
  const classes = useUtilityClasses(classesProp);
  const root = resolveSlotProps(slotProps.root, ownerState);
  const labelProps = resolveSlotProps(slotProps.label, ownerState);
  const selectProps = resolveSlotProps(slotProps.select, ownerState);
  const optionProps = resolveSlotProps(slotProps.option, ownerState);
  const optionTextProps = resolveSlotProps(slotProps.optionText, ownerState);
  const clearProps = resolveSlotProps(slotProps.clearButton, ownerState);
  const helperProps = resolveSlotProps(slotProps.helperText, ownerState);
  const { className: rootClass, style: rootStyle, sx: rootSx, ...rootOther } = root;
  const Label = slots.label ?? VireoSelectInputLabel;
  const SelectSlot = slots.select ?? VireoSelectInputSelect;
  const Option = slots.option ?? VireoSelectInputOption;
  const OptionText = slots.optionText ?? VireoSelectInputOptionText;
  const Clear = slots.clearButton ?? VireoSelectInputClearButton;
  const Helper = slots.helperText ?? VireoSelectInputHelperText;
  const selectedOption = options.find(option => getOptionValue(option) === value);
  const handleChange = (event: SelectChangeEvent<unknown>) =>
    onChange(event.target.value === "" ? null : (event.target.value as TValue));
  return (
    <VireoSelectInputRoot
      {...other}
      {...rootOther}
      as={slots.root}
      ref={ref}
      ownerState={ownerState}
      disabled={disabled}
      error={error}
      className={joinClassNames(classes.root, className, rootClass)}
      style={{ ...style, ...rootStyle }}
      sx={mergeSx(sx, rootSx)}
    >
      {label !== undefined && (
        <Label {...labelProps} ownerState={ownerState} className={joinClassNames(classes.label, labelProps.className)}>
          {label}
        </Label>
      )}
      <SelectSlot
        {...selectProps}
        ownerState={ownerState}
        className={joinClassNames(classes.select, selectProps.className)}
        displayEmpty
        input={<OutlinedInput />}
        inputRef={inputRef}
        value={value ?? ""}
        onChange={handleChange}
        renderValue={() =>
          selectedOption ? renderOption(selectedOption) : <Typography color="text.disabled">{placeholder}</Typography>
        }
        endAdornment={
          !disabled && !disableClearable && value !== null ? (
            <InputAdornment position="end">
              <Clear
                {...clearProps}
                ownerState={ownerState}
                className={joinClassNames(classes.clearButton, clearProps.className)}
                size="small"
                aria-label={clearLabel}
                onClick={() => onChange(null)}
              >
                <Close fontSize="small" />
              </Clear>
            </InputAdornment>
          ) : null
        }
      >
        {options.map(option => {
          const optionValue = getOptionValue(option);
          const content = renderOption(option);
          return (
            <Option
              {...optionProps}
              ownerState={ownerState}
              className={joinClassNames(classes.option, optionProps.className)}
              key={optionValue}
              value={optionValue}
            >
              {typeof content === "string" ? (
                <OptionText
                  {...optionTextProps}
                  ownerState={ownerState}
                  className={joinClassNames(classes.optionText, optionTextProps.className)}
                  primary={content}
                />
              ) : (
                content
              )}
            </Option>
          );
        })}
      </SelectSlot>
      {helperText !== undefined && (
        <Helper
          {...helperProps}
          ownerState={ownerState}
          className={joinClassNames(classes.helperText, helperProps.className)}
        >
          {helperText}
        </Helper>
      )}
    </VireoSelectInputRoot>
  );
}
export const VireoSelectInput = React.forwardRef(VireoSelectInputImpl) as <TOption, TValue extends string | number>(
  props: VireoSelectInputProps<TOption, TValue> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
