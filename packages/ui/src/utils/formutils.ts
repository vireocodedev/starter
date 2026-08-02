import { type UseFormReturn } from "@/hooks/useRgoForm/useRgoForm";
import { type TODO } from "@/utils/typeutils";
import { type FieldValues } from "react-hook-form";

export const RgoFormGroup = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
} as const;

export type RgoFormGroup = (typeof RgoFormGroup)[keyof typeof RgoFormGroup];

export type RgoFormBaseProps<
  TModel extends FieldValues,
  TGroups extends string[] = [typeof RgoFormGroup.CREATE, typeof RgoFormGroup.UPDATE],
> = {
  form: UseFormReturn<TModel>;
  onCancel?: () => void;
  readOnly?: boolean;
  group?: TGroups[number];
  ContentComponent?: React.ComponentType<{ children: React.ReactNode }>;
  ActionsComponent?: React.ComponentType<{ children: React.ReactNode }>;
};

export type RgoInputProps<
  TValue = undefined,
  TSlotProps extends undefined | Record<string, TODO> = undefined,
  TOnChange extends undefined | ((value: TValue, ...args: TODO[]) => void) = undefined,
> = RhfInputProps<TValue, TSlotProps, TOnChange> & RgoInputValidationProps;

export type RgoInputValidationProps = {
  error?: boolean;
  helperText?: string;
};

export type RhfInputProps<
  TValue,
  TSlotProps extends undefined | Record<string, TODO> = undefined,
  TOnChange extends undefined | ((value: TValue, ...args: TODO[]) => void) = undefined,
> = {
  value: TValue;
  onChange: TOnChange extends undefined ? (value: TValue) => void : TOnChange;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  rgoSlotProps?: Partial<TSlotProps>;
};
