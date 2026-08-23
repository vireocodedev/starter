import { VireoForm } from "@/capabilities/forms/components/forms/VireoForm/VireoForm";
import type { VireoFormProps } from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import { VireoFormMultiStep } from "@/capabilities/forms/components/forms/VireoFormMultiStep/VireoFormMultiStep";
import type { VireoFormMultiStepProps } from "@/capabilities/forms/components/forms/VireoFormMultiStep/VireoFormMultiStep.types";
import { VireoFormNextStepButton } from "@/capabilities/forms/components/forms/VireoFormNextStepButton/VireoFormNextStepButton";
import type { VireoFormNextStepButtonProps } from "@/capabilities/forms/components/forms/VireoFormNextStepButton/VireoFormNextStepButton.types";
import { VireoFormPreviousStepButton } from "@/capabilities/forms/components/forms/VireoFormPreviousStepButton/VireoFormPreviousStepButton";
import type { VireoFormPreviousStepButtonProps } from "@/capabilities/forms/components/forms/VireoFormPreviousStepButton/VireoFormPreviousStepButton.types";
import { VireoFormStep } from "@/capabilities/forms/components/forms/VireoFormStep/VireoFormStep";
import type { VireoFormStepProps } from "@/capabilities/forms/components/forms/VireoFormStep/VireoFormStep.types";
import { VireoFormStepProgress } from "@/capabilities/forms/components/forms/VireoFormStepProgress/VireoFormStepProgress";
import type { VireoFormStepProgressProps } from "@/capabilities/forms/components/forms/VireoFormStepProgress/VireoFormStepProgress.types";
import { VireoMultiStepStore } from "@/capabilities/forms/state/vireoMultiStepStore/vireoMultiStepStore";
import type {
  VireoMultiStepChangeEvent,
  VireoMultiStepDescriptor,
  VireoMultiStepNavigationResult,
  VireoMultiStepState,
  VireoMultiStepStepState,
} from "@/capabilities/forms/types/vireoMultiStep.types";
import {
  getVireoFormRuntimeApi,
  useVireoForm,
  type VireoFormApi,
} from "@/capabilities/forms/hooks/useVireoForm/useVireoForm";
import type { FormAsyncValidateOrFn, FormOptions, FormValidateOrFn } from "@tanstack/react-form";
import React from "react";

type StepId<TSteps extends readonly { id: string }[]> = TSteps[number]["id"];

export type VireoMultiStepSubscribeProps<TStepId extends string, TSelected = VireoMultiStepState<TStepId>> = {
  selector?: (state: VireoMultiStepState<TStepId>) => TSelected;
  children: (selected: TSelected) => React.ReactNode;
};

export type UseVireoMultiStepFormOptions<
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
  TSteps extends readonly VireoMultiStepDescriptor<TFormData, string>[],
> = FormOptions<
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
> & {
  steps: TSteps;
  initialStepId?: StepId<TSteps>;
  onStepChange?: (event: VireoMultiStepChangeEvent<StepId<TSteps>>) => void;
};

export type VireoMultiStepFormApi<
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
  TStepId extends string,
> = VireoFormApi<
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
> & {
  Form: React.ForwardRefExoticComponent<VireoFormProps & React.RefAttributes<HTMLFormElement>>;
  MultiStep: React.ForwardRefExoticComponent<VireoFormMultiStepProps & React.RefAttributes<HTMLDivElement>>;
  Step: React.ForwardRefExoticComponent<
    Omit<VireoFormStepProps, "id" | "ref"> & { id: TStepId } & React.RefAttributes<HTMLElement>
  >;
  StepProgress: React.ForwardRefExoticComponent<VireoFormStepProgressProps & React.RefAttributes<HTMLDivElement>>;
  PreviousStepButton: React.ForwardRefExoticComponent<
    VireoFormPreviousStepButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
  NextStepButton: React.ForwardRefExoticComponent<
    VireoFormNextStepButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
  MultiStepSubscribe: <TSelected = VireoMultiStepState<TStepId>>(
    props: VireoMultiStepSubscribeProps<TStepId, TSelected>,
  ) => React.ReactNode;
  readonly multiStepState: VireoMultiStepState<TStepId>;
  readonly steps: readonly VireoMultiStepStepState<TStepId>[];
  readonly activeSteps: readonly VireoMultiStepStepState<TStepId>[];
  readonly currentStep: VireoMultiStepStepState<TStepId>;
  readonly currentStepId: TStepId;
  readonly currentStepIndex: number;
  readonly activeStepCount: number;
  readonly completedStepCount: number;
  readonly isFirstStep: boolean;
  readonly isLastStep: boolean;
  readonly isStepTransitioning: boolean;
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
  readonly canSubmitCurrentStep: boolean;
  getStepState: (id: TStepId) => VireoMultiStepStepState<TStepId> | undefined;
  goToNextStep: () => Promise<VireoMultiStepNavigationResult<TStepId>>;
  goToPreviousStep: () => Promise<VireoMultiStepNavigationResult<TStepId>>;
  goToStep: (id: TStepId) => Promise<VireoMultiStepNavigationResult<TStepId>>;
};

/** Creates one TanStack-backed form with stable, typed multi-step navigation. */
export function useVireoMultiStepForm<
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
  const TSteps extends readonly VireoMultiStepDescriptor<TFormData, string>[],
>(
  options: UseVireoMultiStepFormOptions<
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
    TSteps
  >,
): VireoMultiStepFormApi<
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
  StepId<TSteps>
> {
  const { initialStepId, onStepChange, steps, ...formOptions } = options;
  const form = useVireoForm(formOptions);
  const runtimeForm = getVireoFormRuntimeApi(form);
  const controllerRef = React.useRef<VireoMultiStepStore | undefined>(undefined);
  if (!controllerRef.current) {
    controllerRef.current = new VireoMultiStepStore(
      runtimeForm,
      steps as readonly VireoMultiStepDescriptor<unknown, string>[],
      initialStepId,
      onStepChange as ((event: VireoMultiStepChangeEvent<string>) => void) | undefined,
    );
  }
  const controller = controllerRef.current;

  controller.update(
    steps as readonly VireoMultiStepDescriptor<unknown, string>[],
    onStepChange as ((event: VireoMultiStepChangeEvent<string>) => void) | undefined,
  );
  React.useEffect(() => () => controller.dispose(), [controller]);

  const BoundForm = React.useMemo(() => {
    const Component = React.forwardRef<HTMLFormElement, VireoFormProps>((props, ref) => (
      <VireoForm {...props} ref={ref} form={runtimeForm} multiStepController={controller} />
    ));
    Component.displayName = "VireoBoundMultiStepForm";
    return Component;
  }, [controller, runtimeForm]);

  const BoundMultiStep = React.useMemo(() => {
    const RuntimeMultiStep = VireoFormMultiStep as React.ForwardRefExoticComponent<
      VireoFormMultiStepProps & { controller: VireoMultiStepStore } & React.RefAttributes<HTMLDivElement>
    >;
    const Component = React.forwardRef<HTMLDivElement, VireoFormMultiStepProps>((props, ref) => (
      <RuntimeMultiStep {...props} ref={ref} controller={controller} />
    ));
    Component.displayName = "VireoBoundFormMultiStep";
    return Component;
  }, [controller]);

  const MultiStepSubscribe = React.useMemo(
    () =>
      function BoundMultiStepSubscribe<TSelected = VireoMultiStepState<StepId<TSteps>>>(
        props: VireoMultiStepSubscribeProps<StepId<TSteps>, TSelected>,
      ): React.ReactNode {
        const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
        const selected = props.selector ? props.selector(state as VireoMultiStepState<StepId<TSteps>>) : state;
        return props.children(selected as TSelected);
      },
    [controller],
  );

  return React.useMemo(() => {
    const reset = form.reset.bind(form);
    const facade = new Proxy(form, {
      get(target, property, receiver) {
        const state = controller.getSnapshot();
        if (property === "Form") return BoundForm;
        if (property === "MultiStep") return BoundMultiStep;
        if (property === "Step") return VireoFormStep;
        if (property === "StepProgress") return VireoFormStepProgress;
        if (property === "PreviousStepButton") return VireoFormPreviousStepButton;
        if (property === "NextStepButton") return VireoFormNextStepButton;
        if (property === "MultiStepSubscribe") return MultiStepSubscribe;
        if (property === "multiStepState") return state;
        if (property === "getStepState") return controller.getStepState;
        if (property === "goToNextStep") return controller.goToNextStep.bind(controller);
        if (property === "goToPreviousStep") return controller.goToPreviousStep.bind(controller);
        if (property === "goToStep") return controller.goToStep.bind(controller);
        if (property === "reset")
          return (...args: never[]) => {
            reset(...args);
            controller.reset();
          };
        if (property in state) return state[property as keyof typeof state];
        return Reflect.get(target, property, receiver);
      },
    });
    return facade as unknown as VireoMultiStepFormApi<
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
      StepId<TSteps>
    >;
  }, [BoundForm, BoundMultiStep, MultiStepSubscribe, controller, form]);
}
