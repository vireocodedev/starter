import { VireoForm } from "@/capabilities/forms/components/forms/VireoForm/VireoForm";
import type { VireoFormProps } from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import { VireoFormNumberField } from "@/capabilities/forms/components/forms/VireoFormNumberField/VireoFormNumberField";
import { VireoFormResetButton } from "@/capabilities/forms/components/forms/VireoFormResetButton/VireoFormResetButton";
import { VireoFormSelectField } from "@/capabilities/forms/components/forms/VireoFormSelectField/VireoFormSelectField";
import { VireoFormSwitchField } from "@/capabilities/forms/components/forms/VireoFormSwitchField/VireoFormSwitchField";
import { VireoFormSubmitButton } from "@/capabilities/forms/components/forms/VireoFormSubmitButton/VireoFormSubmitButton";
import { VireoFormTextField } from "@/capabilities/forms/components/forms/VireoFormTextField/VireoFormTextField";
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
    NumberField: VireoFormNumberField,
    SelectField: VireoFormSelectField,
    SwitchField: VireoFormSwitchField,
    TextField: VireoFormTextField,
  },
  fieldContext: vireoFieldContext,
  formComponents: { ResetButton: VireoFormResetButton, SubmitButton: VireoFormSubmitButton },
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
    NumberField: typeof VireoFormNumberField;
    SelectField: typeof VireoFormSelectField;
    SwitchField: typeof VireoFormSwitchField;
    TextField: typeof VireoFormTextField;
  },
  { ResetButton: typeof VireoFormResetButton; SubmitButton: typeof VireoFormSubmitButton }
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
