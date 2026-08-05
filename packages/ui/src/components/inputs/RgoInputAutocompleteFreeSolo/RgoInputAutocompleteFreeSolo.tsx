import {
  RgoInputAutocomplete,
  type RgoInputAutocompleteSlotProps,
} from "@/components/inputs/RgoInputAutocomplete/RgoInputAutocomplete";
import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { Divider, ListItemIcon, ListItemText, MenuItem, Paper } from "@mui/material";
import React, { type ReactNode } from "react";

export type RgoInputAutocompleteFreeSoloProps<TOption> = Omit<
  RgoInputProps<string | null, RgoInputAutocompleteSlotProps<TOption>>,
  "onChange"
> & {
  /** The list of predefined options. */
  options: TOption[];
  /** Extract the display label from an option. */
  getOptionLabel: (option: TOption) => string;
  /** Compare two options for equality. */
  isOptionEqualToValue: (option: TOption, value: TOption) => boolean;
  /** Extract the string value to persist from an option. */
  getStringValue: (option: TOption) => string | null;
  /** Build a synthetic option object from a free-text string (used when the value doesn't match any existing option). */
  createSyntheticOption: (text: string) => TOption;
  /**
   * Renders the "add `<text>`" menu entry shown below the option list when
   * the user has typed text. Returning a string is fine; returning a styled
   * element (e.g. `<Typography fontWeight={600}>{t("add")} '{input}'</Typography>`)
   * gives the consumer full control over translations and styling.
   */
  addLabel: (input: string) => ReactNode;
  /**
   * Optional leading icon for the "add" menu entry. The library doesn't ship
   * a default since the icon registry is consumer-augmented — pass
   * `<RgoIcon icon="plus" />` (or any other node) if you want one.
   */
  addIcon?: ReactNode;
  /** The current string value. */
  value: string | null;
  /** Called with the new string value (or null when cleared). */
  onChange: (value: string | null) => void;
};

function RgoInputAutocompleteFreeSoloImpl<TOption>(
  {
    options,
    getOptionLabel,
    isOptionEqualToValue,
    getStringValue,
    createSyntheticOption,
    addLabel,
    addIcon,
    value,
    onChange,
    rgoSlotProps,
    ...rest
  }: RgoInputAutocompleteFreeSoloProps<TOption>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const [searchText, setSearchText] = React.useState("");

  const resolvedValue = React.useMemo(() => {
    if (value == null) return null;
    const found = options.find(opt => getStringValue(opt) === value);
    return found ?? createSyntheticOption(value);
  }, [value, options, getStringValue, createSyntheticOption]);

  const PaperComponent = (props: React.HTMLAttributes<HTMLElement>) => (
    <Paper {...props}>
      {props.children}
      {searchText.trim().length > 0 && (
        <>
          <Divider />
          <MenuItem
            onMouseDown={event => event.preventDefault()}
            onClick={() => {
              onChange(searchText);
              (document.activeElement as HTMLElement)?.blur();
            }}
          >
            {addIcon && <ListItemIcon>{addIcon}</ListItemIcon>}
            <ListItemText primary={addLabel(searchText)} />
          </MenuItem>
        </>
      )}
    </Paper>
  );

  return (
    <RgoInputAutocomplete<TOption>
      {...rest}
      ref={ref}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      value={resolvedValue}
      onChange={opt => onChange(opt ? getStringValue(opt) : null)}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      rgoSlotProps={{
        ...rgoSlotProps,
        root: {
          ...rgoSlotProps?.root,
          slotProps: {
            ...((rgoSlotProps?.root as Record<string, unknown>)?.slotProps as Record<string, unknown>),
            paper: {
              component: PaperComponent,
            },
          },
        },
      }}
    />
  );
}

export const RgoInputAutocompleteFreeSolo = fixedForwardRef(RgoInputAutocompleteFreeSoloImpl);
