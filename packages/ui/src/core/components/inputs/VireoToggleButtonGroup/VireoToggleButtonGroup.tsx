import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { Close } from "@mui/icons-material";
import { Tooltip, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import {
  getVireoToggleButtonGroupUtilityClass,
  type VireoToggleButtonGroupClassKey,
} from "./VireoToggleButtonGroup.classes";
import { VIREO_TOGGLE_BUTTON_GROUP_NAME, type VireoToggleButtonGroupSlotName } from "./VireoToggleButtonGroup.identity";
import {
  VireoToggleButtonGroupClearButton,
  VireoToggleButtonGroupGroup,
  VireoToggleButtonGroupHelperText,
  VireoToggleButtonGroupOption,
  VireoToggleButtonGroupRoot,
} from "./VireoToggleButtonGroup.styled";
import type { VireoToggleButtonGroupProps } from "./VireoToggleButtonGroup.types";
function useUtilityClasses(classes?: Partial<Record<VireoToggleButtonGroupClassKey, string>>) {
  return composeClasses(
    {
      root: ["root"],
      group: ["group"],
      option: ["option"],
      clearButton: ["clearButton"],
      helperText: ["helperText"],
    } as const satisfies UtilityClassSlotMap<VireoToggleButtonGroupSlotName, VireoToggleButtonGroupClassKey>,
    getVireoToggleButtonGroupUtilityClass,
    classes,
  );
}
function VireoToggleButtonGroupImpl<T>(
  inProps: VireoToggleButtonGroupProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_TOGGLE_BUTTON_GROUP_NAME });
  const {
    className,
    classes: classesProp,
    clearLabel = "Clear selection",
    disableClearable = false,
    disabled = false,
    error = false,
    getOptionProps,
    helperText,
    multiple = false,
    onChange,
    options,
    renderKey,
    renderOption,
    slotProps = {},
    slots = {},
    style,
    sx,
    value,
    ...other
  } = props as VireoToggleButtonGroupProps<T> & {
    clearLabel?: string;
    className?: string;
    style?: React.CSSProperties;
    sx?: VireoToggleButtonGroupProps<T>["sx"];
  };
  const hasValue = multiple ? (value as readonly T[]).length > 0 : value !== null;
  const ownerState = { disabled, error, multiple, hasValue };
  const classes = useUtilityClasses(classesProp);
  const root = resolveSlotProps(slotProps.root, ownerState);
  const group = resolveSlotProps(slotProps.group, ownerState);
  const option = resolveSlotProps(slotProps.option, ownerState);
  const clear = resolveSlotProps(slotProps.clearButton, ownerState);
  const helper = resolveSlotProps(slotProps.helperText, ownerState);
  const { className: rootClassName, style: rootStyle, sx: rootSx, ...rootOther } = root;
  const { className: groupClassName, ...groupOther } = group;
  const { className: optionClassName, ...optionOther } = option;
  const { className: clearClassName, ...clearOther } = clear;
  const { className: helperClassName, ...helperOther } = helper;
  const Group = slots.group ?? VireoToggleButtonGroupGroup;
  const Option = slots.option ?? VireoToggleButtonGroupOption;
  const ClearButton = slots.clearButton ?? VireoToggleButtonGroupClearButton;
  const HelperText = slots.helperText ?? VireoToggleButtonGroupHelperText;
  const handleChange = (_event: React.MouseEvent<HTMLElement>, next: T | T[] | null) => {
    if (!multiple && disableClearable && next === null) return;
    if (multiple) (onChange as (value: T[]) => void)((next ?? []) as T[]);
    else (onChange as (value: T | null) => void)(next as T | null);
  };
  const clearValue = () => {
    if (multiple) (onChange as (value: T[]) => void)([]);
    else (onChange as (value: T | null) => void)(null);
  };
  return (
    <VireoToggleButtonGroupRoot
      {...other}
      {...rootOther}
      as={slots.root}
      ref={ref}
      ownerState={ownerState}
      error={error}
      disabled={disabled}
      className={joinClassNames(classes.root, className, rootClassName)}
      style={{ ...style, ...rootStyle }}
      sx={mergeSx(sx, rootSx)}
    >
      <Group
        {...groupOther}
        ownerState={ownerState}
        exclusive={!multiple}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className={joinClassNames(classes.group, groupClassName)}
      >
        {options.map(item => (
          <Option
            {...optionOther}
            {...getOptionProps?.(item)}
            ownerState={ownerState}
            key={renderKey(item)}
            value={item}
            className={joinClassNames(classes.option, optionClassName)}
          >
            {renderOption(item)}
          </Option>
        ))}
        {!disableClearable && hasValue && (
          <Tooltip title={clearLabel}>
            <ClearButton
              {...clearOther}
              ownerState={ownerState}
              className={joinClassNames(classes.clearButton, clearClassName)}
              size="small"
              aria-label={clearLabel}
              onClick={clearValue}
            >
              <Close fontSize="small" />
            </ClearButton>
          </Tooltip>
        )}
      </Group>
      {helperText !== undefined && (
        <HelperText
          {...helperOther}
          ownerState={ownerState}
          className={joinClassNames(classes.helperText, helperClassName)}
        >
          {helperText}
        </HelperText>
      )}
    </VireoToggleButtonGroupRoot>
  );
}
export const VireoToggleButtonGroup = React.forwardRef(VireoToggleButtonGroupImpl) as <T>(
  props: VireoToggleButtonGroupProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
