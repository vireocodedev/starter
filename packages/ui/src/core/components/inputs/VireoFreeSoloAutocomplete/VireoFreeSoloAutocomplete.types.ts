import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { AutocompleteProps, TextFieldProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFreeSoloAutocompleteClasses,
  type VireoFreeSoloAutocompleteClassKey,
} from "./VireoFreeSoloAutocomplete.classes";
import type {
  VIREO_FREE_SOLO_AUTOCOMPLETE_NAME,
  VireoFreeSoloAutocompleteSlotName,
} from "./VireoFreeSoloAutocomplete.identity";

export type VireoFreeSoloAutocompleteOwnerState = { disabled: boolean; error: boolean; hasValue: boolean };

export interface VireoFreeSoloAutocompleteRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFreeSoloAutocomplete}. */
export type VireoFreeSoloAutocompleteSlots = {
  [TSlotName in VireoFreeSoloAutocompleteSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFreeSoloAutocomplete}. */
export type VireoFreeSoloAutocompleteSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFreeSoloAutocompleteSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoFreeSoloAutocompleteRootSlotPropsOverrides, VireoFreeSoloAutocompleteOwnerState>;
  }
>;

/** Props owned by {@link VireoFreeSoloAutocomplete}. */
export type VireoFreeSoloAutocompleteOwnProps<TOption> = VireoFreeSoloAutocompleteSlotsAndSlotProps & {
  value: string | null;
  onChange: (value: string | null) => void;
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
    AutocompleteProps<TOption, false, boolean, false>,
    "disabled" | "getOptionLabel" | "isOptionEqualToValue" | "onChange" | "options" | "renderInput" | "value"
  >;
  textFieldProps?: TextFieldProps;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFreeSoloAutocompleteClasses>;
};

/** Props VireoFreeSoloAutocomplete inherits from its default root after excluding component-owned props. */
export type VireoFreeSoloAutocompleteInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;

/** Props accepted by {@link VireoFreeSoloAutocomplete}. */
export type VireoFreeSoloAutocompleteProps<TOption> = VireoFreeSoloAutocompleteOwnProps<TOption> &
  VireoFreeSoloAutocompleteInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_FREE_SOLO_AUTOCOMPLETE_NAME]: VireoFreeSoloAutocompleteProps<unknown>;
  }

  interface ComponentNameToClassKey {
    [VIREO_FREE_SOLO_AUTOCOMPLETE_NAME]: VireoFreeSoloAutocompleteClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_FREE_SOLO_AUTOCOMPLETE_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_FREE_SOLO_AUTOCOMPLETE_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_FREE_SOLO_AUTOCOMPLETE_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_FREE_SOLO_AUTOCOMPLETE_NAME];
    };
  }
}
