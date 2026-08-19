import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { AutocompleteProps, AutocompleteRenderOptionState, BoxProps, TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoAutocompleteMultipleClasses,
  VireoAutocompleteMultipleClassKey,
} from "./VireoAutocompleteMultiple.classes";
import type {
  VIREO_AUTOCOMPLETE_MULTIPLE_NAME,
  VireoAutocompleteMultipleSlotName,
} from "./VireoAutocompleteMultiple.identity";
export type VireoAutocompleteMultipleOwnerState = {
  disabled: boolean;
  error: boolean;
  loading: boolean;
  hasValue: boolean;
};
export interface VireoAutocompleteMultipleRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoAutocompleteMultipleSlots = { [T in VireoAutocompleteMultipleSlotName]: React.ElementType };
export type VireoAutocompleteMultipleSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoAutocompleteMultipleSlots,
  { root: SlotProps<"div", VireoAutocompleteMultipleRootSlotPropsOverrides, VireoAutocompleteMultipleOwnerState> }
>;
export type VireoAutocompleteMultipleOptions<TOption> =
  readonly TOption[] | ((searchText: string) => Promise<readonly TOption[]> | readonly TOption[]);
export type VireoAutocompleteMultipleOwnProps<TOption> = VireoAutocompleteMultipleSlotsAndSlotProps & {
  value: readonly TOption[];
  onChange: (value: TOption[]) => void;
  options: VireoAutocompleteMultipleOptions<TOption>;
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
    AutocompleteProps<TOption, true, boolean, false>,
    | "disabled"
    | "getOptionLabel"
    | "isOptionEqualToValue"
    | "multiple"
    | "onChange"
    | "options"
    | "renderInput"
    | "value"
  >;
  textFieldProps?: TextFieldProps;
  classes?: Partial<VireoAutocompleteMultipleClasses>;
};
export type VireoAutocompleteMultipleInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;
export type VireoAutocompleteMultipleProps<TOption> = VireoAutocompleteMultipleOwnProps<TOption> &
  VireoAutocompleteMultipleInheritedProps;
declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_AUTOCOMPLETE_MULTIPLE_NAME]: VireoAutocompleteMultipleProps<unknown>;
  }
  interface ComponentNameToClassKey {
    [VIREO_AUTOCOMPLETE_MULTIPLE_NAME]: VireoAutocompleteMultipleClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_AUTOCOMPLETE_MULTIPLE_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_AUTOCOMPLETE_MULTIPLE_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_AUTOCOMPLETE_MULTIPLE_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_AUTOCOMPLETE_MULTIPLE_NAME];
    };
  }
}
