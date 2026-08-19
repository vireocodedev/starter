import { useUnsavedChangesRegistration } from "@/capabilities/unsaved-changes/public";
import { Box, type BoxProps, type SxProps, type Theme } from "@mui/material";
import React from "react";
import { type FieldErrors, type FieldValues, type Path, useFormState, type UseFormReturn } from "react-hook-form";

export type GuardedFormUnsavedChangesGuard = "dirty" | "none";

export type GuardedFormSlotProps = {
  form: Omit<BoxProps<"form">, "children" | "component" | "onSubmit">;
};

export type GuardedFormProps<TForm extends FieldValues> = {
  form: UseFormReturn<TForm>;
  onSubmit: (request: TForm) => void | Promise<void>;
  children: React.ReactNode;
  enablePropagation?: boolean;
  slotProps?: GuardedFormSlotProps;
  unsavedChangesBusy?: boolean;
  unsavedChangesGuard?: GuardedFormUnsavedChangesGuard;
};

const ERROR_METADATA_KEYS = new Set(["message", "ref", "root", "type", "types"]);

function getErrorFieldPaths(errors: FieldErrors<FieldValues>, prefix = ""): string[] {
  const paths: string[] = [];

  for (const [key, error] of Object.entries(errors)) {
    if (ERROR_METADATA_KEYS.has(key) || error == null) continue;

    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof error === "object" && ("message" in error || "type" in error || "ref" in error)) {
      paths.push(path);
      continue;
    }

    if (typeof error === "object") {
      paths.push(...getErrorFieldPaths(error as FieldErrors<FieldValues>, path));
    }
  }

  return paths;
}

function focusAndScroll(element: HTMLElement) {
  element.focus({ preventScroll: true });
  element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

function mergeFormSx(sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const baseSx: SxProps<Theme> = { position: "relative" };

  if (!sx) {
    return baseSx;
  }

  return (Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx]) as SxProps<Theme>;
}

export function GuardedForm<TForm extends FieldValues>({
  form,
  onSubmit,
  children,
  enablePropagation = false,
  slotProps,
  unsavedChangesBusy = false,
  unsavedChangesGuard = "dirty",
}: GuardedFormProps<TForm>) {
  const { errors, isDirty, isSubmitted, isSubmitting, isValid, submitCount } = useFormState({ control: form.control });

  useUnsavedChangesRegistration({
    dirty: isDirty,
    busy: isSubmitting || unsavedChangesBusy,
    enabled: unsavedChangesGuard === "dirty",
  });

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const handledInvalidSubmitRef = React.useRef(0);

  React.useEffect(() => {
    if (!isSubmitted || isSubmitting || isValid || handledInvalidSubmitRef.current >= submitCount) return;

    const errorPaths = getErrorFieldPaths(errors as FieldErrors<FieldValues>);
    if (errorPaths.length === 0) return;
    handledInvalidSubmitRef.current = submitCount;

    // Conditional form content (for example, a collapsed invoice item card) gets
    // one render to reveal its invalid field before focus is resolved.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const root = formRef.current;
        if (!root) return;

        const controls = root.querySelectorAll<HTMLElement>('input, textarea, select, [role="combobox"]');
        const firstErroredControl = Array.from(controls).find(element => {
          const name = element.getAttribute("name");
          return element.getAttribute("aria-invalid") === "true" || (name != null && errorPaths.includes(name));
        });
        if (firstErroredControl) {
          focusAndScroll(firstErroredControl);
          return;
        }

        form.setFocus(errorPaths[0] as Path<TForm>);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [errors, form, isSubmitted, isSubmitting, isValid, submitCount]);

  const { ref: externalFormRef, sx: formSx, ...formSlotProps } = slotProps?.form ?? {};
  const setFormElement = React.useCallback(
    (element: HTMLFormElement | null) => {
      formRef.current = element;
      assignRef(externalFormRef as React.Ref<HTMLFormElement> | undefined, element);
    },
    [externalFormRef],
  );

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!enablePropagation) {
        event.stopPropagation();
      }

      void form.handleSubmit(onSubmit)(event);
    },
    [enablePropagation, form, onSubmit],
  );

  return (
    <Box {...formSlotProps} component="form" ref={setFormElement} onSubmit={handleSubmit} sx={mergeFormSx(formSx)}>
      {children}
    </Box>
  );
}
