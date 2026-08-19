import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { AutocompleteProps, TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFreeSoloAutocompleteMultipleClasses,
  type VireoFreeSoloAutocompleteMultipleClassKey,
} from "./VireoFreeSoloAutocompleteMultiple.classes";
import type {
  VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME,
  VireoFreeSoloAutocompleteMultipleSlotName,
} from "./VireoFreeSoloAutocompleteMultiple.identity";

export type VireoFreeSoloAutocompleteMultipleOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };

export interface VireoFreeSoloAutocompleteMultipleRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFreeSoloAutocompleteMultiple}. */
export type VireoFreeSoloAutocompleteMultipleSlots = {
  [TSlotName in VireoFreeSoloAutocompleteMultipleSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFreeSoloAutocompleteMultiple}. */
export type VireoFreeSoloAutocompleteMultipleSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFreeSoloAutocompleteMultipleSlots,
  {
    /** @default 'div' */
    root: SlotProps<
      "div",
      VireoFreeSoloAutocompleteMultipleRootSlotPropsOverrides,
      VireoFreeSoloAutocompleteMultipleOwnerState
    >;
  }
>;

/** Props owned by {@link VireoFreeSoloAutocompleteMultiple}. */
export type VireoFreeSoloAutocompleteMultipleOwnProps<TOption> = VireoFreeSoloAutocompleteMultipleSlotsAndSlotProps & {
  value: readonly string[] | null;
  onChange: (value: string[] | null) => void;
  options: readonly TOption[];
  getOptionLabel: (option: TOption) => string;
  isOptionEqualToValue: (option: TOption, value: TOption) => boolean;
  getStringValue: (option: TOption) => string | null;
  createSyntheticOption: (text: string) => TOption;
  addLabel: (input: string) => React.ReactNode;
  addIcon?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
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
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFreeSoloAutocompleteMultipleClasses>;
};

/** Props VireoFreeSoloAutocompleteMultiple inherits from its default root after excluding component-owned props. */
export type VireoFreeSoloAutocompleteMultipleInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "component" | "onChange"
>;

/** Props accepted by {@link VireoFreeSoloAutocompleteMultiple}. */
export type VireoFreeSoloAutocompleteMultipleProps<TOption> = VireoFreeSoloAutocompleteMultipleOwnProps<TOption> &
  VireoFreeSoloAutocompleteMultipleInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME]: VireoFreeSoloAutocompleteMultipleProps<unknown>;
  }

  interface ComponentNameToClassKey {
    [VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME]: VireoFreeSoloAutocompleteMultipleClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME];
    };
  }
}
