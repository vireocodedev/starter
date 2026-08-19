import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import {
  Box,
  Checkbox,
  OutlinedInput,
  Typography,
  unstable_composeClasses as composeClasses,
  type SelectChangeEvent,
} from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import {
  getVireoSelectMultipleInputUtilityClass,
  type VireoSelectMultipleInputClassKey,
} from "./VireoSelectMultipleInput.classes";
import {
  VIREO_SELECT_MULTIPLE_INPUT_NAME,
  type VireoSelectMultipleInputSlotName,
} from "./VireoSelectMultipleInput.identity";
import {
  VireoSelectMultipleInputHelperText,
  VireoSelectMultipleInputLabel,
  VireoSelectMultipleInputOption,
  VireoSelectMultipleInputOptionText,
  VireoSelectMultipleInputRoot,
  VireoSelectMultipleInputSelect,
} from "./VireoSelectMultipleInput.styled";
import type { VireoSelectMultipleInputProps } from "./VireoSelectMultipleInput.types";
function useUtilityClasses(classes?: Partial<Record<VireoSelectMultipleInputClassKey, string>>) {
  return composeClasses(
    {
      root: ["root"],
      label: ["label"],
      select: ["select"],
      option: ["option"],
      optionText: ["optionText"],
      helperText: ["helperText"],
    } as const satisfies UtilityClassSlotMap<VireoSelectMultipleInputSlotName, VireoSelectMultipleInputClassKey>,
    getVireoSelectMultipleInputUtilityClass,
    classes,
  );
}
function Impl<TOption, TValue extends string | number>(
  inProps: VireoSelectMultipleInputProps<TOption, TValue>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_SELECT_MULTIPLE_INPUT_NAME });
  const {
    className,
    classes: classesProp,
    disabled = false,
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
  } = props as VireoSelectMultipleInputProps<TOption, TValue> & {
    className?: string;
    style?: React.CSSProperties;
    sx?: VireoSelectMultipleInputProps<TOption, TValue>["sx"];
  };
  const ownerState = { disabled, error, hasValue: value.length > 0 };
  const classes = useUtilityClasses(classesProp);
  const root = resolveSlotProps(slotProps.root, ownerState);
  const labelProps = resolveSlotProps(slotProps.label, ownerState);
  const selectProps = resolveSlotProps(slotProps.select, ownerState);
  const optionProps = resolveSlotProps(slotProps.option, ownerState);
  const optionTextProps = resolveSlotProps(slotProps.optionText, ownerState);
  const helperProps = resolveSlotProps(slotProps.helperText, ownerState);
  const { className: rootClass, style: rootStyle, sx: rootSx, ...rootOther } = root;
  const Label = slots.label ?? VireoSelectMultipleInputLabel;
  const SelectSlot = slots.select ?? VireoSelectMultipleInputSelect;
  const Option = slots.option ?? VireoSelectMultipleInputOption;
  const OptionText = slots.optionText ?? VireoSelectMultipleInputOptionText;
  const Helper = slots.helperText ?? VireoSelectMultipleInputHelperText;
  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const next = event.target.value;
    onChange((typeof next === "string" ? next.split(",") : next) as TValue[]);
  };
  const selected = value
    .map(item => options.find(option => getOptionValue(option) === item))
    .filter((option): option is TOption => option !== undefined);
  return (
    <VireoSelectMultipleInputRoot
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
        multiple
        displayEmpty
        input={<OutlinedInput />}
        inputRef={inputRef}
        value={[...value]}
        onChange={handleChange}
        renderValue={() =>
          selected.length === 0 ? (
            <Typography color="text.disabled">{placeholder}</Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((option, index) => (
                <React.Fragment key={getOptionValue(option)}>
                  {index > 0 ? ", " : null}
                  {renderOption(option)}
                </React.Fragment>
              ))}
            </Box>
          )
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
              <Checkbox checked={value.includes(optionValue)} />
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
    </VireoSelectMultipleInputRoot>
  );
}
export const VireoSelectMultipleInput = React.forwardRef(Impl) as <TOption, TValue extends string | number>(
  props: VireoSelectMultipleInputProps<TOption, TValue> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
