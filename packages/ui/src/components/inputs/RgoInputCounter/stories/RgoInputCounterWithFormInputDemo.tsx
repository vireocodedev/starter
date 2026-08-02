import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputCounter } from "@/components/inputs/RgoInputCounter/RgoInputCounter";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Stack } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

const schema = () =>
  z.object({
    quantity: z
      .number({ required_error: "Quantity is required" })
      .min(1, "Minimum quantity is 1")
      .max(99, "Maximum quantity is 99"),
  });

type FormValues = z.infer<ReturnType<typeof schema>>;

export function RgoInputCounterWithFormInputDemo() {
  const t = useTranslationLocal();

  const { control, handleSubmit } = useRgoForm<FormValues>({
    t,
    schema,
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ maxWidth: 300 }}>
        <Controller
          name="quantity"
          control={control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Quantity">
              <RgoInputCounter
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </RgoLabelBox>
          )}
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </form>
  );
}

export const RgoInputCounterWithFormInputDemoCode = `
import { RgoLabelBox, RgoInputCounter } from "@vireocodedev/starter-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { Controller, useRgoForm } from "react-hook-form";
import z from "zod";

const schema = z.object({
  quantity: z.number({ required_error: "Quantity is required" }).min(1, "Minimum quantity is 1").max(99, "Maximum quantity is 99"),
});

type FormValues = z.infer<typeof schema>;

export function RgoInputCounterWithFormInputDemo() {
  const { control, handleSubmit } = useRgoForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ maxWidth: 300 }}>
        <Controller
          name="quantity"
          control={control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Quantity">
              <RgoInputCounter
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </RgoLabelBox>
          )}
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </form>
  );
}`;
