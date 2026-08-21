import { type RgoTranslationFn } from "@/setup/config/RgoLocale";
import { type ReactStateSetter, type TODO } from "@/utils/typeutils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CardActions, Step as MuiStep, StepButton, StepLabel, Stepper } from "@mui/material";
import React, { useCallback, useState } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";

type LegacyMultiStepFormReturn<FormData extends FieldValues> = UseFormReturn<FormData> & {
  submitDisabled: boolean;
};

type MultiStepFormSchema<FormData extends FieldValues, TTranslationFn> = (t: TTranslationFn) => z.ZodType<FormData>;

export type StepComponentProps<FormData extends FieldValues> = {
  form: LegacyMultiStepFormReturn<FormData>;
};

export type StepComponent<FormData extends FieldValues> = React.FC<StepComponentProps<FormData>>;

export type Step<FormData extends FieldValues> = {
  component: StepComponent<FormData>;
  fields: Path<FormData>[];
  label: string;
};

export type StepConfigFn<FormData extends FieldValues, TTranslationFn = RgoTranslationFn> = (
  t: TTranslationFn,
) => Step<FormData>[];

export type UseMultiStepFormProps<FormData extends FieldValues, TTranslationFn = RgoTranslationFn> = {
  steps: StepConfigFn<FormData, TTranslationFn>;
  schema: MultiStepFormSchema<FormData, TTranslationFn>;
  initialValues: DefaultValues<FormData>;
  t: TTranslationFn;
};

export function useRgoMultiStepForm<FormData extends FieldValues, TTranslationFn = RgoTranslationFn>({
  steps: stepConfigFn,
  schema,
  initialValues,
  t,
}: UseMultiStepFormProps<FormData, TTranslationFn>) {
  const steps = React.useMemo(() => {
    return stepConfigFn(t);
  }, [stepConfigFn, t]);

  const [currentStepIndex, setCurrentStepIndexLocal] = useState<number>(0);
  const [touched, setTouched] = useState<boolean[]>(() => Array(steps.length).fill(false));

  const resolver = React.useMemo(() => zodResolver(schema(t)), [schema, t]);
  const rhfForm = useForm<FormData>({
    resolver,
    defaultValues: initialValues,
  });
  const submitDisabled =
    rhfForm.formState.isSubmitting || (rhfForm.formState.isSubmitted && !rhfForm.formState.isValid);
  const form = Object.assign(rhfForm, { submitDisabled }) as LegacyMultiStepFormReturn<FormData>;

  const {
    trigger,
    formState: { errors },
  } = form;

  const validate = React.useCallback(async () => {
    const fields = steps[currentStepIndex].fields;
    const isValid = await trigger(fields);
    setTouched(prev => {
      const newTouched = [...prev];
      newTouched[currentStepIndex] = true;
      return newTouched;
    });
    return isValid;
  }, [trigger, steps, currentStepIndex]);

  const setCurrentStepIndex: ReactStateSetter<number> = React.useCallback(
    value => {
      if (typeof value === "function") {
        setCurrentStepIndexLocal(prev => {
          if (prev !== currentStepIndex) validate();
          return value(prev);
        });
      } else {
        if (value !== currentStepIndex) validate();
        setCurrentStepIndexLocal(value);
      }
    },
    [validate, currentStepIndex],
  );

  const goToNextStep = useCallback(async () => {
    const isValid = await validate();
    if (!isValid) return;

    setCurrentStepIndex(prevStep => {
      if (prevStep >= steps.length - 1) return prevStep;
      return prevStep + 1;
    });
  }, [steps, validate, setCurrentStepIndex]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStepIndex(prevStep => {
      if (prevStep <= 0) return prevStep;
      return prevStep - 1;
    });
  }, [setCurrentStepIndex]);

  const CurrentStep = steps[currentStepIndex].component;

  const CurrentStepComponent = React.useMemo(() => {
    return () => <CurrentStep form={form} />;
  }, [CurrentStep, form]);

  const isFirstStep = currentStepIndex <= 0;
  const isLastStep = currentStepIndex >= steps.length - 1;

  const StepperComponent: React.ComponentType = React.useMemo(() => {
    return () => {
      function get(obj: TODO, path: string) {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
      }

      const completed = steps.map(step => {
        return !step.fields.some(field => !!get(errors, field));
      });

      const error = steps.map(step => {
        return step.fields.some(field => !!get(errors, field));
      });

      return (
        <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <Stepper
            nonLinear
            activeStep={currentStepIndex}
            sx={{
              gap: "16px",
              width: "100%",
              fontWeight: 600,
              "& .MuiStepConnector-root": {
                width: "24px",
              },
              "& .MuiStepLabel-label:not(.Mui-active)": {
                color: "var(--mui-palette-grey-500)",
              },
            }}
          >
            {steps.map(({ label }, index) => (
              <MuiStep key={label} completed={touched[index] && completed[index]}>
                <StepButton color="inherit" onClick={() => setCurrentStepIndex(index)}>
                  <StepLabel error={error[index]}>{label}</StepLabel>
                </StepButton>
              </MuiStep>
            ))}
          </Stepper>
        </Box>
      );
    };
  }, [steps, currentStepIndex, errors, touched, setCurrentStepIndex]);

  const NavigationButtonsComponent = React.useMemo(() => {
    return () => (
      <CardActions>
        {!isFirstStep && (
          <Button type="button" variant="outlined" color="secondary" onClick={goToPreviousStep}>
            Previous
          </Button>
        )}
        {!isLastStep && (
          <Button type="button" variant="contained" color="primary" onClick={goToNextStep}>
            Next
          </Button>
        )}
        {isLastStep && (
          <Button color="primary" variant="contained" type="submit" disabled={submitDisabled}>
            Submit
          </Button>
        )}
      </CardActions>
    );
  }, [isFirstStep, isLastStep, goToPreviousStep, goToNextStep, submitDisabled]);

  return {
    form,
    CurrentStepComponent,
    StepperComponent,
    NavigationButtonsComponent,
    currentStepIndex,
    setCurrentStepIndex,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
  };
}
