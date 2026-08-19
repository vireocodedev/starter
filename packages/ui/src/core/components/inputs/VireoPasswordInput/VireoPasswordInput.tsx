import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { getVireoPasswordInputUtilityClass, type VireoPasswordInputClassKey } from "./VireoPasswordInput.classes";
import { VIREO_PASSWORD_INPUT_NAME, type VireoPasswordInputSlotName } from "./VireoPasswordInput.identity";
import { VireoPasswordInputRoot, VireoPasswordInputVisibilityButton } from "./VireoPasswordInput.styled";
import type { VireoPasswordInputProps } from "./VireoPasswordInput.types";
function useUtilityClasses(classes?: VireoPasswordInputProps["classes"]) {
  return composeClasses(
    { root: ["root"], visibilityButton: ["visibilityButton"] } as const satisfies UtilityClassSlotMap<
      VireoPasswordInputSlotName,
      VireoPasswordInputClassKey
    >,
    getVireoPasswordInputUtilityClass,
    classes,
  );
}
/** Controlled password field with an accessible visibility toggle and native-input ref. */
export const VireoPasswordInput = React.forwardRef<HTMLInputElement, VireoPasswordInputProps>(
  function VireoPasswordInput(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: VIREO_PASSWORD_INPUT_NAME });
    const {
      className,
      classes: classesProp,
      disabled = false,
      error = false,
      hidePasswordLabel = "Hide password",
      onChange,
      showPasswordLabel = "Show password",
      slotProps = {},
      slots = {},
      style,
      sx,
      value,
      visibilityIcon = <Visibility />,
      visibilityOffIcon = <VisibilityOff />,
      ...other
    } = props;
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const ownerState = { disabled, error, passwordVisible };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const button = resolveSlotProps(slotProps.visibilityButton, ownerState);
    const { className: rootClassName, style: rootStyle, sx: rootSx, slotProps: muiSlotProps, ...rootOther } = root;
    const { className: buttonClassName, ...buttonOther } = button;
    const VisibilityButton = slots.visibilityButton ?? VireoPasswordInputVisibilityButton;
    const adornment = (
      <InputAdornment position="end">
        <VisibilityButton
          {...buttonOther}
          ownerState={ownerState}
          className={joinClassNames(classes.visibilityButton, buttonClassName)}
          edge="end"
          aria-label={passwordVisible ? hidePasswordLabel : showPasswordLabel}
          onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault()}
          onClick={() => setPasswordVisible(current => !current)}
        >
          {passwordVisible ? visibilityOffIcon : visibilityIcon}
        </VisibilityButton>
      </InputAdornment>
    );
    return (
      <VireoPasswordInputRoot
        {...other}
        {...rootOther}
        as={slots.root}
        inputRef={ref}
        ownerState={ownerState}
        disabled={disabled}
        error={error}
        type={passwordVisible ? "text" : "password"}
        value={value ?? ""}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        autoComplete={other.autoComplete ?? "current-password"}
        placeholder={other.placeholder ?? "********"}
        slotProps={{ ...muiSlotProps, input: { ...muiSlotProps?.input, endAdornment: adornment } }}
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      />
    );
  },
);
VireoPasswordInput.displayName = VIREO_PASSWORD_INPUT_NAME;
