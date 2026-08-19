import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { getVireoNumberInputUtilityClass, type VireoNumberInputClassKey } from "./VireoNumberInput.classes";
import { VIREO_NUMBER_INPUT_NAME, type VireoNumberInputSlotName } from "./VireoNumberInput.identity";
import { VireoNumberInputRoot } from "./VireoNumberInput.styled";
import type { VireoNumberInputProps } from "./VireoNumberInput.types";
const VALID_NUMBER = /^-?(?:\d+|\d*\.\d+)$/;
function useUtilityClasses(classes?: VireoNumberInputProps["classes"]) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<VireoNumberInputSlotName, VireoNumberInputClassKey>,
    getVireoNumberInputUtilityClass,
    classes,
  );
}
/** Controlled numeric text input that preserves editable intermediate text and emits only complete numbers. */
export const VireoNumberInput = React.forwardRef<HTMLInputElement, VireoNumberInputProps>(
  function VireoNumberInput(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: VIREO_NUMBER_INPUT_NAME });
    const {
      className,
      classes: classesProp,
      disabled = false,
      error = false,
      max,
      min,
      onChange,
      slotProps = {},
      slots = {},
      style,
      sx,
      value,
      ...other
    } = props;
    const [text, setText] = React.useState(() => (value === null ? "" : String(value)));
    React.useEffect(() => {
      if (value === null) {
        setText("");
        return;
      }
      const clamped = Math.min(max ?? value, Math.max(min ?? value, value));
      setText(current => (current === "" || Number(current) !== clamped ? String(clamped) : current));
      if (clamped !== value) onChange(clamped);
    }, [max, min, onChange, value]);
    const ownerState = { disabled, error };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const { className: rootClassName, style: rootStyle, sx: rootSx, ...rootOther } = root;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value.replace(/,/g, ".");
      if (
        /[^\d.-]/.test(next) ||
        next.split(".").length > 2 ||
        (next.match(/-/g)?.length ?? 0) > 1 ||
        next.indexOf("-") > 0
      )
        return;
      if (next.trim() === "") {
        setText("");
        onChange(null);
        return;
      }
      setText(next);
      if (!VALID_NUMBER.test(next)) return;
      const parsed = Number.parseFloat(next);
      const clamped = Math.min(max ?? parsed, Math.max(min ?? parsed, parsed));
      setText(clamped === parsed ? next : String(clamped));
      onChange(clamped);
    };
    return (
      <VireoNumberInputRoot
        {...other}
        {...rootOther}
        as={slots.root}
        inputRef={ref}
        ownerState={ownerState}
        disabled={disabled}
        error={error}
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      />
    );
  },
);
VireoNumberInput.displayName = VIREO_NUMBER_INPUT_NAME;
