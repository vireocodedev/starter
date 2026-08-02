import {
  RgoInputAutocompleteMultiple,
  type RgoInputAutocompleteMultipleSlotProps,
} from "@/components/inputs/RgoInputAutocompleteMultiple/RgoInputAutocompleteMultiple";
import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { Divider, ListItemIcon, ListItemText, MenuItem, Paper } from "@mui/material";
import React, { type ReactNode } from "react";

export type RgoInputAutocompleteFreeSoloMultipleProps<TOption> = Omit<
  RgoInputProps<string[], RgoInputAutocompleteMultipleSlotProps<TOption>>,
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
   * Renders the "add `<text>`" menu entry. See {@link RgoInputAutocompleteFreeSolo}
   * for the rationale (consumer owns translation + styling).
   */
  addLabel: (input: string) => ReactNode;
  /**
   * Optional leading icon for the "add" menu entry. The library doesn't ship
   * a default since the icon registry is consumer-augmented.
   */
  addIcon?: ReactNode;
  /** The current string array value. */
  value: string[] | null;
  /** Called with the new string array value (or null when cleared). */
  onChange: (value: string[] | null) => void;
};

function RgoInputAutocompleteFreeSoloMultipleImpl<TOption>(
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
  }: RgoInputAutocompleteFreeSoloMultipleProps<TOption>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const [searchText, setSearchText] = React.useState("");

  const resolvedValue = React.useMemo(() => {
    if (value == null || value.length === 0) return [];
    return value.map(v => {
      const found = options.find(opt => getStringValue(opt) === v);
      return found ?? createSyntheticOption(v);
    });
  }, [value, options, getStringValue, createSyntheticOption]);

  const handleAdd = (text: string) => {
    const current = value ?? [];
    if (!current.includes(text)) {
      onChange([...current, text]);
    }
    setSearchText("");
  };

  const PaperComponent = (props: React.HTMLAttributes<HTMLElement>) => (
    <Paper {...props}>
      {props.children}
      {searchText.trim().length > 0 && (
        <>
          <Divider />
          <MenuItem
            onMouseDown={event => event.preventDefault()}
            onClick={() => {
              handleAdd(searchText);
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
    <RgoInputAutocompleteMultiple<TOption>
      {...rest}
      ref={ref}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      value={resolvedValue}
      onChange={opts => {
        if (!opts || opts.length === 0) {
          onChange(null);
        } else {
          onChange(opts.map(opt => getStringValue(opt)).filter((v): v is string => v != null));
        }
      }}
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

export const RgoInputAutocompleteFreeSoloMultiple = fixedForwardRef(RgoInputAutocompleteFreeSoloMultipleImpl);
