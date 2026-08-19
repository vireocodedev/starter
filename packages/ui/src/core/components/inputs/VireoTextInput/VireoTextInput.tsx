import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { getVireoTextInputUtilityClass, type VireoTextInputClassKey } from "./VireoTextInput.classes";
import { VIREO_TEXT_INPUT_NAME, type VireoTextInputSlotName } from "./VireoTextInput.identity";
import { VireoTextInputRoot } from "./VireoTextInput.styled";
import type { VireoTextInputProps } from "./VireoTextInput.types";

function useUtilityClasses(classes?: VireoTextInputProps["classes"]) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<VireoTextInputSlotName, VireoTextInputClassKey>,
    getVireoTextInputUtilityClass,
    classes,
  );
}

/** A controlled text field that reports value-level changes and forwards its ref to the native input. */
export const VireoTextInput = React.forwardRef<HTMLInputElement, VireoTextInputProps>(
  function VireoTextInput(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: VIREO_TEXT_INPUT_NAME });
    const {
      className,
      classes: classesProp,
      disabled = false,
      error = false,
      onChange,
      slotProps = {},
      slots = {},
      style,
      sx,
      value,
      ...other
    } = props;
    const ownerState = { disabled, error };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const { className: rootClassName, style: rootStyle, sx: rootSx, ...rootOther } = root;
    return (
      <VireoTextInputRoot
        {...other}
        {...rootOther}
        as={slots.root}
        inputRef={ref}
        ownerState={ownerState}
        disabled={disabled}
        error={error}
        value={value ?? ""}
        onChange={event => onChange(event.target.value)}
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      />
    );
  },
);
VireoTextInput.displayName = VIREO_TEXT_INPUT_NAME;
