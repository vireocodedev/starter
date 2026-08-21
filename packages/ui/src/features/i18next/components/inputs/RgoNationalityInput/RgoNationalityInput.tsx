import { RgoNationalityFlag } from "@/features/i18next/components/data-display/RgoNationalityFlag/RgoNationalityFlag";
import { InputAutocomplete } from "@/inputs/InputAutocomplete";
import { type RgoNationality } from "@/features/i18next/models/RgoNationality";
import { type RgoLocale } from "@/setup/config/RgoLocale";
import { RGO_COUNTRY_CODES, getCountryName } from "@/utils/countryutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { InputAdornment, ListItemIcon, ListItemText, MenuItem, type TextFieldProps } from "@mui/material";
import React from "react";
import "./RgoNationalityInput.css";

export type RgoNationalityInputSlotProps = {
  textField: TextFieldProps;
};

export type RgoNationalityInputProps = {
  value: RgoNationality | null;
  onChange: (value: RgoNationality | null) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  rgoSlotProps?: Partial<RgoNationalityInputSlotProps>;
  locale: RgoLocale;
};

function RgoNationalityInputImpl(
  { rgoSlotProps, locale, ...controllerProps }: RgoNationalityInputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const textFieldProps = rgoSlotProps?.textField || {};

  const startAdornment = controllerProps.value ? (
    <InputAdornment position="start" sx={{ pl: 1 }}>
      <RgoNationalityFlag countryCode={controllerProps.value} />
    </InputAdornment>
  ) : undefined;

  const renderOption = React.useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: RgoNationality) => {
      return (
        <MenuItem {...props} key={option}>
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <RgoNationalityFlag countryCode={option} />
          </ListItemIcon>
          <ListItemText
            primary={getCountryName(option, locale)}
            slotProps={{
              primary: { fontWeight: 500 },
            }}
          />
        </MenuItem>
      );
    },
    [locale],
  );

  return (
    <InputAutocomplete
      {...controllerProps}
      inputRef={ref}
      startAdornment={startAdornment}
      options={RGO_COUNTRY_CODES}
      getOptionLabel={option => getCountryName(option, locale)}
      isOptionEqualToValue={(option, value) => option === value}
      renderOption={renderOption}
      slotProps={{
        textField: {
          ...textFieldProps,
          sx: {
            ...(textFieldProps.sx ?? {}),
            "& .MuiInputBase-root": {
              paddingLeft: "12px !important",
            },
            "& .MuiInputBase-input": {
              paddingLeft: "4px !important",
            },
          },
        },
      }}
    />
  );
}

export const RgoNationalityInput = fixedForwardRef(RgoNationalityInputImpl);
