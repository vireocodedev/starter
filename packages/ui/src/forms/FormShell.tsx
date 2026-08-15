import { GuardedForm, type GuardedFormUnsavedChangesGuard } from "@/forms/GuardedForm";
import { Button, CardActions, CardContent } from "@mui/material";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import React from "react";
import { type FieldValues, type UseFormReturn } from "react-hook-form";

export type FormShellProps<TForm extends FieldValues> = {
  form: UseFormReturn<TForm> & { submitDisabled?: boolean };
  children: React.ReactNode;
  onCancel?: () => void;
  group?: string;
  ContentComponent?: React.ComponentType<{ children: React.ReactNode }>;
  ActionsComponent?: React.ComponentType<{ children: React.ReactNode }>;
  defaultSubmitLabel?: string;
  fullHeight?: boolean;
  hideActions?: boolean;
  isPending?: boolean;
  onSubmit: (data: TForm) => void | Promise<void>;
  readOnly?: boolean;
  submitDisabled?: boolean;
  submitLabel?: string;
  unsavedChangesGuard?: GuardedFormUnsavedChangesGuard;
};

export function FormShell<TForm extends FieldValues>({
  form,
  onCancel,
  ContentComponent = CardContent,
  ActionsComponent = CardActions,
  children,
  defaultSubmitLabel,
  fullHeight = false,
  hideActions = false,
  isPending = false,
  group,
  onSubmit,
  readOnly = false,
  submitDisabled = false,
  submitLabel,
  unsavedChangesGuard = "dirty",
}: FormShellProps<TForm>) {
  const { t } = usePlatformTranslation();
  const resolvedSubmitLabel =
    submitLabel ?? defaultSubmitLabel ?? (group === "CREATE" ? t("common.create") : t("common.save"));
  const submittingRef = React.useRef(false);

  const handleSubmit = React.useCallback(
    async (data: TForm) => {
      if (readOnly || submittingRef.current) {
        return;
      }

      submittingRef.current = true;
      try {
        await onSubmit(data);
      } finally {
        submittingRef.current = false;
      }
    },
    [onSubmit, readOnly],
  );

  return (
    <GuardedForm<TForm>
      form={form}
      onSubmit={handleSubmit}
      unsavedChangesBusy={isPending}
      unsavedChangesGuard={unsavedChangesGuard}
      slotProps={
        fullHeight
          ? {
              form: {
                sx: theme => ({
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                  [theme.breakpoints.down("sm")]: { overflowY: "auto" },
                }),
              },
            }
          : undefined
      }
    >
      <ContentComponent>{children}</ContentComponent>

      {!hideActions && !readOnly && (
        <ActionsComponent>
          {onCancel ? (
            <Button color="inherit" onClick={onCancel} disabled={isPending || form.formState.isSubmitting}>
              {t("common.cancel")}
            </Button>
          ) : null}
          <Button variant="contained" type="submit" disabled={isPending || submitDisabled || form.submitDisabled}>
            {resolvedSubmitLabel}
          </Button>
        </ActionsComponent>
      )}
    </GuardedForm>
  );
}
