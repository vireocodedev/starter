import { RgoInputText } from "@/components/inputs/RgoInputText/RgoInputText";
import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import type { TextFieldProps } from "@mui/material";
import { IconButton, InputAdornment } from "@mui/material";
import React from "react";
import "./RgoInputPassword.css";

export type RgoInputPasswordSlotProps = {
  root: Omit<TextFieldProps, keyof RgoInputProps | "inputRef" | "type">;
};

export type RgoInputPasswordProps = RgoInputProps<string | null, RgoInputPasswordSlotProps> & {
  visibilityOffIcon?: React.ReactNode;
  visibilityIcon?: React.ReactNode;
};

function RgoInputPasswordImpl(
  { visibilityOffIcon, visibilityIcon, rgoSlotProps, ...controllerProps }: RgoInputPasswordProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const [showPassword, setShowPassword] = React.useState(false);
  const placeholder = rgoSlotProps?.root?.placeholder ?? "********";
  const visibilityIconComputed = visibilityIcon ?? <Visibility />;
  const visibilityOffIconComputed = visibilityOffIcon ?? <VisibilityOff />;
  const type = showPassword ? "text" : "password";

  const togglePasswordVisibility = React.useCallback(() => setShowPassword(show => !show), []);

  const handleMouseDown = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  const handleMouseUp = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label={showPassword ? "hide the password" : "display the password"}
        onClick={togglePasswordVisibility}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        edge="end"
      >
        {showPassword ? visibilityOffIconComputed : visibilityIconComputed}
      </IconButton>
    </InputAdornment>
  );

  return (
    <RgoInputText
      ref={ref}
      {...controllerProps}
      rgoSlotProps={{
        root: {
          ...rootProps,
          type,
          placeholder,
          autoComplete: rootProps.autoComplete ?? "current-password",
          slotProps: {
            ...(rootProps?.slotProps || {}),
            input: {
              ...(rootProps?.slotProps?.input || {}),
              endAdornment,
            },
          },
        },
      }}
    />
  );
}

export const RgoInputPassword = fixedForwardRef(RgoInputPasswordImpl);
