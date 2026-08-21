import { VireoForm } from "@/capabilities/forms/components/forms/VireoForm/VireoForm";
import type { VireoFormProps } from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import { VireoFormActions } from "@/capabilities/forms/components/forms/VireoFormActions/VireoFormActions";
import { VireoFormAutocompleteField } from "@/capabilities/forms/components/forms/VireoFormAutocompleteField/VireoFormAutocompleteField";
import { VireoFormAutocompleteMultipleField } from "@/capabilities/forms/components/forms/VireoFormAutocompleteMultipleField/VireoFormAutocompleteMultipleField";
import { VireoFormFreeSoloAutocompleteField } from "@/capabilities/forms/components/forms/VireoFormFreeSoloAutocompleteField/VireoFormFreeSoloAutocompleteField";
import { VireoFormCheckboxField } from "@/capabilities/forms/components/forms/VireoFormCheckboxField/VireoFormCheckboxField";
import { VireoFormCounterField } from "@/capabilities/forms/components/forms/VireoFormCounterField/VireoFormCounterField";
import { VireoFormFileField } from "@/capabilities/forms/components/forms/VireoFormFileField/VireoFormFileField";
import { VireoFormFileListField } from "@/capabilities/forms/components/forms/VireoFormFileListField/VireoFormFileListField";
import { VireoFormNumberField } from "@/capabilities/forms/components/forms/VireoFormNumberField/VireoFormNumberField";
import { VireoFormRadioGroupField } from "@/capabilities/forms/components/forms/VireoFormRadioGroupField/VireoFormRadioGroupField";
import { VireoFormResetButton } from "@/capabilities/forms/components/forms/VireoFormResetButton/VireoFormResetButton";
import { VireoFormSection } from "@/capabilities/forms/components/forms/VireoFormSection/VireoFormSection";
import { VireoFormSectionItem } from "@/capabilities/forms/components/forms/VireoFormSectionItem/VireoFormSectionItem";
import { VireoFormSelectField } from "@/capabilities/forms/components/forms/VireoFormSelectField/VireoFormSelectField";
import { VireoFormSelectMultipleField } from "@/capabilities/forms/components/forms/VireoFormSelectMultipleField/VireoFormSelectMultipleField";
import { VireoFormSwitchField } from "@/capabilities/forms/components/forms/VireoFormSwitchField/VireoFormSwitchField";
import { VireoFormSubmitButton } from "@/capabilities/forms/components/forms/VireoFormSubmitButton/VireoFormSubmitButton";
import { VireoFormTemporalField } from "@/capabilities/forms/components/forms/VireoFormTemporalField/VireoFormTemporalField";
import { VireoFormTextField } from "@/capabilities/forms/components/forms/VireoFormTextField/VireoFormTextField";
import { VireoFormToggleButtonGroupField } from "@/capabilities/forms/components/forms/VireoFormToggleButtonGroupField/VireoFormToggleButtonGroupField";
import {
  vireoFieldContext,
  vireoTanStackFormContext,
} from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import type { AppFieldExtendedReactFormApi } from "@tanstack/react-form";
import {
  createFormHook,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
} from "@tanstack/react-form";
import React from "react";

const { useAppForm } = createFormHook({
  fieldComponents: {
    AutocompleteField: VireoFormAutocompleteField,
    AutocompleteMultipleField: VireoFormAutocompleteMultipleField,
    FreeSoloAutocompleteField: VireoFormFreeSoloAutocompleteField,
    CheckboxField: VireoFormCheckboxField,
    CounterField: VireoFormCounterField,
    FileField: VireoFormFileField,
    FileListField: VireoFormFileListField,
    NumberField: VireoFormNumberField,
    RadioGroupField: VireoFormRadioGroupField,
    SelectField: VireoFormSelectField,
    SelectMultipleField: VireoFormSelectMultipleField,
    SwitchField: VireoFormSwitchField,
    TemporalField: VireoFormTemporalField,
    TextField: VireoFormTextField,
    ToggleButtonGroupField: VireoFormToggleButtonGroupField,
  },
  fieldContext: vireoFieldContext,
  formComponents: {
    Actions: VireoFormActions,
    ResetButton: VireoFormResetButton,
    Section: VireoFormSection,
    SectionItem: VireoFormSectionItem,
    SubmitButton: VireoFormSubmitButton,
  },
  formContext: vireoTanStackFormContext,
});

type BaseVireoFormApi<
  TFormData,
  TOnMount extends undefined | FormValidateOrFn<TFormData>,
  TOnChange extends undefined | FormValidateOrFn<TFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends undefined | FormValidateOrFn<TFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
  TSubmitMeta,
> = AppFieldExtendedReactFormApi<
  TFormData,
  TOnMount,
  TOnChange,
  TOnChangeAsync,
  TOnBlur,
  TOnBlurAsync,
  TOnSubmit,
  TOnSubmitAsync,
  TOnDynamic,
  TOnDynamicAsync,
  TOnServer,
  TSubmitMeta,
  {
    AutocompleteField: typeof VireoFormAutocompleteField;
    AutocompleteMultipleField: typeof VireoFormAutocompleteMultipleField;
    FreeSoloAutocompleteField: typeof VireoFormFreeSoloAutocompleteField;
    CheckboxField: typeof VireoFormCheckboxField;
    CounterField: typeof VireoFormCounterField;
    FileField: typeof VireoFormFileField;
    FileListField: typeof VireoFormFileListField;
    NumberField: typeof VireoFormNumberField;
    RadioGroupField: typeof VireoFormRadioGroupField;
    SelectField: typeof VireoFormSelectField;
    SelectMultipleField: typeof VireoFormSelectMultipleField;
    SwitchField: typeof VireoFormSwitchField;
    TemporalField: typeof VireoFormTemporalField;
    TextField: typeof VireoFormTextField;
    ToggleButtonGroupField: typeof VireoFormToggleButtonGroupField;
  },
  {
    Actions: typeof VireoFormActions;
    ResetButton: typeof VireoFormResetButton;
    Section: typeof VireoFormSection;
    SectionItem: typeof VireoFormSectionItem;
    SubmitButton: typeof VireoFormSubmitButton;
  }
>;

export type VireoFormApi<
  TFormData,
  TOnMount extends undefined | FormValidateOrFn<TFormData>,
  TOnChange extends undefined | FormValidateOrFn<TFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends undefined | FormValidateOrFn<TFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
  TSubmitMeta,
> = Omit<
  BaseVireoFormApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  >,
  "AppField" | "AppForm" | "Field"
> & {
  Field: BaseVireoFormApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  >["AppField"];
  Form: React.ForwardRefExoticComponent<VireoFormProps & React.RefAttributes<HTMLFormElement>>;
};

export function useVireoForm<
  TFormData,
  TOnMount extends undefined | FormValidateOrFn<TFormData>,
  TOnChange extends undefined | FormValidateOrFn<TFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends undefined | FormValidateOrFn<TFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
  TSubmitMeta,
>(
  options: FormOptions<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  >,
): VireoFormApi<
  TFormData,
  TOnMount,
  TOnChange,
  TOnChangeAsync,
  TOnBlur,
  TOnBlurAsync,
  TOnSubmit,
  TOnSubmitAsync,
  TOnDynamic,
  TOnDynamicAsync,
  TOnServer,
  TSubmitMeta
> {
  const appForm = useAppForm(options);

  const BoundForm = React.useMemo(() => {
    const Component = React.forwardRef<HTMLFormElement, VireoFormProps>((props, ref) => (
      <VireoForm {...props} ref={ref} form={appForm} />
    ));
    Component.displayName = "VireoBoundForm";
    return Component;
  }, [appForm]);

  return React.useMemo(() => {
    const facade = new Proxy(appForm, {
      get(target, property, receiver) {
        if (property === "AppField" || property === "AppForm") return undefined;
        if (property === "Field") return target.AppField;
        if (property === "Form") return BoundForm;
        return Reflect.get(target, property, receiver);
      },
      has(target, property) {
        if (property === "AppField" || property === "AppForm") return false;
        if (property === "Form") return true;
        return Reflect.has(target, property);
      },
      ownKeys(target) {
        return [...Reflect.ownKeys(target).filter(key => key !== "AppField" && key !== "AppForm"), "Form"];
      },
      getOwnPropertyDescriptor(target, property) {
        if (property === "AppField" || property === "AppForm") return undefined;
        if (property === "Field") {
          return { configurable: true, enumerable: true, value: target.AppField, writable: false };
        }
        if (property === "Form") {
          return { configurable: true, enumerable: true, value: BoundForm, writable: false };
        }
        return Reflect.getOwnPropertyDescriptor(target, property);
      },
    });

    return facade as unknown as VireoFormApi<
      TFormData,
      TOnMount,
      TOnChange,
      TOnChangeAsync,
      TOnBlur,
      TOnBlurAsync,
      TOnSubmit,
      TOnSubmitAsync,
      TOnDynamic,
      TOnDynamicAsync,
      TOnServer,
      TSubmitMeta
    >;
  }, [appForm, BoundForm]);
}
