import { type RgoInputProps } from "@/utils/formutils";
import { TextField, type TextFieldProps } from "@mui/material";
import React, { useEffect, useState } from "react";
import "./RgoInputNumber.css";

export type RgoInputNumberSlotProps = {
  root: Omit<TextFieldProps, "type" | "inputRef" | keyof RgoInputProps>;
};

export type RgoInputNumberProps = RgoInputProps<number | null, RgoInputNumberSlotProps> & {
  min?: number;
  max?: number;
};

// Regex to test if the string is a valid complete number (integer or decimal).
const VALID_NUMBER_REGEX = /^-?(?:\d+|\d*\.\d+)$/;

const stringContainsAlphaOrSpecialCharactersExceptDot = (str: string) => {
  return /[^\d.-]/.test(str);
};

export const RgoInputNumber = React.forwardRef<HTMLInputElement, RgoInputNumberProps>(
  ({ value, onChange, min, max, rgoSlotProps, ...controllerProps }, ref) => {
    const rootProps = rgoSlotProps?.root ?? {};

    // Local state holds the string representation.
    const [inputValue, setInputValue] = useState<string>(() => (value !== null ? String(value) : ""));

    // When parent's value changes, update local state and validate against min/max.
    useEffect(() => {
      if (value === null) {
        setInputValue("");
        return;
      }

      let clampedValue = value;
      let hasChanged = false;

      // Clamp value to min/max bounds
      if (min !== undefined && value < min) {
        clampedValue = min;
        hasChanged = true;
      } else if (max !== undefined && value > max) {
        clampedValue = max;
        hasChanged = true;
      }

      const valueStr = String(clampedValue);

      // Update input value if it's different
      setInputValue(prev => {
        // Treat empty string as "no value" so transitioning from "" to a numeric
        // string (e.g. "0") always updates the displayed value.
        const shouldUpdate = valueStr !== prev && (prev === "" || Number(valueStr) !== Number(prev));
        return shouldUpdate ? valueStr : prev;
      });

      // If value was clamped, notify parent of the corrected value
      if (hasChanged) {
        onChange?.(clampedValue);
      }
    }, [value, min, max, onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Treat comma as a decimal point, same as dot.
      const newValue = e.target.value.replace(/,/g, ".");

      if (stringContainsAlphaOrSpecialCharactersExceptDot(newValue) || newValue.split(".").length > 2) {
        return;
      }

      const onTextAndValueChange = (value: number | null, text: string) => {
        setInputValue(text);
        onChange?.(value);
      };

      // If empty, treat as no value.
      if (newValue.trim() === "") return onTextAndValueChange(null, "");

      // if newValue has 2 or more hyphens, return early.
      if ((newValue.match(/-/g) || []).length > 1 || newValue.indexOf("-") > 0) return;

      setInputValue(newValue);

      // Only trigger onChange if the newValue fully matches our valid number format.
      if (VALID_NUMBER_REGEX.test(newValue)) {
        const parsed = parseFloat(newValue);
        if (min !== undefined && parsed < min) return onTextAndValueChange(min, String(min));
        if (max !== undefined && parsed > max) return onTextAndValueChange(max, String(max));
        onTextAndValueChange(parsed, newValue);
      }
    };

    return (
      <TextField
        {...rootProps}
        {...controllerProps}
        inputRef={ref}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
      />
    );
  },
);
