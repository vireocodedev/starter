import { RgoIcon } from "@/components/data-display/RgoIcon/RgoIcon";
import { RgoSnack } from "@/components/data-display/RgoSnack/RgoSnack";
import { RgoSnackDetailsButton } from "@/components/data-display/RgoSnackDetailsButton/RgoSnackDetailsButton";
import {
  serializeError,
  type RgoMutationData,
  type RgoMutationVariables,
} from "@/utils/apiutils";
import { type TODO } from "@/utils/typeutils";
import {
  useMutation,
  type DefaultError,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

export type UseMutationBasicProps<
  TData = unknown,
  TVariables = void,
  TError = DefaultError,
  TContext = unknown,
> = {
  mutationFn: UseMutationOptions<
    TData,
    TError,
    TVariables,
    TContext
  >["mutationFn"];
  messageSuccess?: string | ((data: TData) => string | undefined);
  messageError?: string | ((error: TError) => string | undefined);
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  >;
};

export type UseMutationBasicPropsOptions<
  TMutationFn extends (...args: TODO[]) => TODO,
  TError = DefaultError,
  TContext = unknown,
> = UseMutationBasicProps<
  RgoMutationData<TMutationFn>,
  RgoMutationVariables<TMutationFn>,
  TError,
  TContext
>["options"];

export function useRgoMutation<
  TData = unknown,
  TVariables = void,
  TError = DefaultError,
  TContext = unknown,
>({
  mutationFn,
  messageSuccess,
  messageError,
  options = {},
}: UseMutationBasicProps<TData, TVariables, TError, TContext>) {
  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn,
    onSuccess: (...args) => {
      options.onSuccess?.(...args);
      const [data] = args;
      if (messageSuccess) {
        const message =
          typeof messageSuccess === "function"
            ? messageSuccess(data)
            : messageSuccess;
        if (message) {
          toast.custom(() => (
            <RgoSnack
              variant="success"
              startAdornment={<RgoIcon icon="check-circle" />}
              message={message}
            />
          ));
        }
      }
    },
    onError: (...args) => {
      options.onError?.(...args);
      const [error] = args;
      if (messageError) {
        const message =
          typeof messageError === "function"
            ? messageError(error)
            : messageError;
        if (message) {
          toast.custom(() => (
            <RgoSnack
              variant="error"
              startAdornment={<RgoIcon icon="x-circle" />}
              message={message}
              endAdornment={
                <RgoSnackDetailsButton data={serializeError(error)} />
              }
            />
          ));
        }
      }
    },
  });
}
