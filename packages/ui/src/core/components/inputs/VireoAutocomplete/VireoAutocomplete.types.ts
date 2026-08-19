import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { AutocompleteProps, AutocompleteRenderOptionState, TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoAutocompleteClasses, type VireoAutocompleteClassKey } from "./VireoAutocomplete.classes";
import type { VIREO_AUTOCOMPLETE_NAME, VireoAutocompleteSlotName } from "./VireoAutocomplete.identity";

export type VireoAutocompleteOwnerState = { disabled: boolean; error: boolean; loading: boolean; hasValue: boolean };

export interface VireoAutocompleteRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoAutocomplete}. */
export type VireoAutocompleteSlots = {
  [TSlotName in VireoAutocompleteSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoAutocomplete}. */
export type VireoAutocompleteSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoAutocompleteSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoAutocompleteRootSlotPropsOverrides, VireoAutocompleteOwnerState>;
  }
>;

/** Props owned by {@link VireoAutocomplete}. */
export type VireoAutocompleteOptions<TOption> =
  readonly TOption[] | ((searchText: string) => Promise<readonly TOption[]> | readonly TOption[]);
export type VireoAutocompleteOwnProps<TOption> = VireoAutocompleteSlotsAndSlotProps & {
  value: TOption | null;
  onChange: (value: TOption | null) => void;
  options: VireoAutocompleteOptions<TOption>;
  standaloneOptions?: readonly TOption[];
  getOptionLabel: (option: TOption) => string;
  isOptionEqualToValue: (option: TOption, value: TOption) => boolean;
  getOptionDisabled?: (option: TOption) => boolean;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
    option: TOption,
    state: AutocompleteRenderOptionState,
  ) => React.ReactNode;
  searchText?: string;
  onSearchTextChange?: (value: string) => void;
  searchMinLength?: number;
  debounceDelay?: number;
  sortOptions?: boolean | ((left: TOption, right: TOption) => number);
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  autocompleteProps?: Omit<
    AutocompleteProps<TOption, false, boolean, false>,
    "disabled" | "getOptionLabel" | "isOptionEqualToValue" | "onChange" | "options" | "renderInput" | "value"
  >;
  textFieldProps?: TextFieldProps;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoAutocompleteClasses>;
};

/** Props VireoAutocomplete inherits from its default root after excluding component-owned props. */
export type VireoAutocompleteInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;

/** Props accepted by {@link VireoAutocomplete}. */
export type VireoAutocompleteProps<TOption> = VireoAutocompleteOwnProps<TOption> & VireoAutocompleteInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_AUTOCOMPLETE_NAME]: VireoAutocompleteProps<unknown>;
  }

  interface ComponentNameToClassKey {
    [VIREO_AUTOCOMPLETE_NAME]: VireoAutocompleteClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_AUTOCOMPLETE_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_AUTOCOMPLETE_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_AUTOCOMPLETE_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_AUTOCOMPLETE_NAME];
    };
  }
}
