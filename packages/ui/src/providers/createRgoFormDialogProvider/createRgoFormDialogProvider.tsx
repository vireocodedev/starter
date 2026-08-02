import { type RgoProvider } from "@/providers/RgoProviders";
import { type UseFormReturn } from "@/hooks/useRgoForm/useRgoForm";
import { type RgoFormGroup } from "@/utils/formutils";
import React from "react";
import { type FieldValues } from "react-hook-form";

/**
 * Base shape every form-dialog config must satisfy.
 *
 * - `group`: which form-group is active for the current dialog session.
 * - `onCancel`: invoked when the dialog is closed without a successful submit.
 *
 * `onSubmitSuccess` is intentionally *not* on the base because its entity
 * type varies per dialog. Each concrete config should declare it explicitly.
 */
export interface RgoFormDialogConfigBase {
  group?: RgoFormGroup;
  onCancel?: () => void;
}

export interface RgoFormDialogContextValue<TOpenArg, TConfig extends RgoFormDialogConfigBase> {
  open: boolean;
  handleOpen: (arg: TOpenArg, callerConfig?: TConfig) => void;
  handleClose: () => void;
}

export interface RgoFormDialogRenderHelpers<TEntity extends FieldValues, TConfig extends RgoFormDialogConfigBase> {
  open: boolean;
  config: TConfig | null;
  form: UseFormReturn<TEntity>;
  handleClose: () => void;
  handleSubmitSuccess: (entity: TEntity) => void;
}

export interface RgoFormDialogSubmitSuccessHelpers<
  TEntity extends FieldValues,
  TConfig extends RgoFormDialogConfigBase,
> {
  form: UseFormReturn<TEntity>;
  config: TConfig | null;
  setConfig: React.Dispatch<React.SetStateAction<TConfig | null>>;
  /** Closes the dialog without invoking `onCancel`. */
  defaultClose: () => void;
}

export interface CreateRgoFormDialogProviderOptions<
  TEntity extends FieldValues,
  TConfig extends RgoFormDialogConfigBase,
  TOpenArg = TEntity,
> {
  /**
   * Hook that creates the form. Called inside the Provider component,
   * so it must obey the rules of hooks. Use this to inject a
   * pre-configured form hook (e.g. `useLmsForm`) so translations and
   * other app-specific concerns flow in naturally.
   */
  useForm: () => UseFormReturn<TEntity>;
  /**
   * Map the `handleOpen` argument to form data passed to `form.reset`.
   * Defaults to identity (treats the arg as the entity).
   */
  resolveFormData?: (arg: TOpenArg) => TEntity;
  /**
   * Build the persisted config from the open arg + caller-provided config.
   * Typically: derive `group` from `arg.id`, copy callbacks through.
   */
  resolveConfig: (arg: TOpenArg, callerConfig: TConfig | undefined) => TConfig;
  /**
   * Override submit-success behavior.
   *
   * Default: looks for `onSubmitSuccess` on the resolved config and invokes
   * it with the persisted entity, then closes the dialog without calling
   * `onCancel`. Override to keep the dialog open, transition `group`, or
   * re-seed the form with the persisted entity.
   */
  onSubmitSuccess?: (entity: TEntity, helpers: RgoFormDialogSubmitSuccessHelpers<TEntity, TConfig>) => void;
  /**
   * Render JSX alongside `children` — typically a `<Dialog>` containing a
   * header and the form. Helpers expose the form, current config, and the
   * close / submit-success callbacks.
   */
  renderDialog: (helpers: RgoFormDialogRenderHelpers<TEntity, TConfig>) => React.ReactNode;
  /** Optional display name surfaced in the `useFormDialog` error message. */
  displayName?: string;
}

export interface CreateRgoFormDialogProviderResult<TOpenArg, TConfig extends RgoFormDialogConfigBase> {
  Provider: RgoProvider;
  Context: React.Context<RgoFormDialogContextValue<TOpenArg, TConfig> | undefined>;
  useFormDialog: () => RgoFormDialogContextValue<TOpenArg, TConfig>;
}

/**
 * Build a provider + context + hook triplet that owns a single form-dialog.
 *
 * The factory abstracts the boilerplate every form-dialog provider repeats:
 * - `useState<TConfig | null>` + `open` derivation
 * - `handleOpen` that resets the form and stores the config
 * - `handleClose` that calls `onCancel` and clears the config
 * - `handleSubmitSuccess` that calls `onSubmitSuccess` and clears the config
 * - Context, Provider, and a typed `useFormDialog` hook
 *
 * Callers retain full control over the dialog JSX through `renderDialog`,
 * including the `<Dialog>` itself, header, and form composition.
 */
export function createRgoFormDialogProvider<
  TEntity extends FieldValues,
  TConfig extends RgoFormDialogConfigBase,
  TOpenArg = TEntity,
>(
  options: CreateRgoFormDialogProviderOptions<TEntity, TConfig, TOpenArg>,
): CreateRgoFormDialogProviderResult<TOpenArg, TConfig> {
  const { useForm, resolveFormData, resolveConfig, onSubmitSuccess, renderDialog, displayName } = options;

  const Context = React.createContext<RgoFormDialogContextValue<TOpenArg, TConfig> | undefined>(undefined);
  if (displayName) Context.displayName = `${displayName}Context`;

  const Provider: RgoProvider = ({ children }) => {
    const [config, setConfig] = React.useState<TConfig | null>(null);
    const open = config !== null;
    const form = useForm();

    const configRef = React.useRef(config);
    configRef.current = config;

    const handleOpen = React.useCallback<RgoFormDialogContextValue<TOpenArg, TConfig>["handleOpen"]>(
      (arg, callerConfig) => {
        const data = resolveFormData ? resolveFormData(arg) : (arg as unknown as TEntity);
        form.reset(data);
        const resolved = resolveConfig(arg, callerConfig);
        setConfig(resolved);
      },
      [form],
    );

    const defaultClose = React.useCallback(() => {
      setConfig(null);
    }, []);

    const handleClose = React.useCallback(() => {
      configRef.current?.onCancel?.();
      setConfig(null);
    }, []);

    const handleSubmitSuccess = React.useCallback(
      (entity: TEntity) => {
        if (onSubmitSuccess) {
          onSubmitSuccess(entity, { form, config: configRef.current, setConfig, defaultClose });
          return;
        }
        const submitSuccess = (configRef.current as { onSubmitSuccess?: (entity: TEntity) => void } | null)
          ?.onSubmitSuccess;
        submitSuccess?.(entity);
        setConfig(null);
      },
      [form, defaultClose],
    );

    const contextValue = React.useMemo<RgoFormDialogContextValue<TOpenArg, TConfig>>(
      () => ({ open, handleOpen, handleClose }),
      [open, handleOpen, handleClose],
    );

    return (
      <Context.Provider value={contextValue}>
        {children}
        {renderDialog({ open, config, form, handleClose, handleSubmitSuccess })}
      </Context.Provider>
    );
  };
  if (displayName) Provider.displayName = displayName;

  const useFormDialog = (): RgoFormDialogContextValue<TOpenArg, TConfig> => {
    const value = React.useContext(Context);
    if (!value) {
      const name = displayName ?? "RgoFormDialog";
      throw new Error(`use${name} must be used within ${name}Provider`);
    }
    return value;
  };

  return { Provider, Context, useFormDialog };
}
