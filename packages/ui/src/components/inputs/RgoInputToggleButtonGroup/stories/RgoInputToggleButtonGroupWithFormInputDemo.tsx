import { RgoLabelBox } from "@/core/public";
import { RgoInputToggleButtonGroup } from "@/components/inputs/RgoInputToggleButtonGroup/RgoInputToggleButtonGroup";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Stack } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

const OPTIONS = ["Small", "Medium", "Large"];

const schema = () =>
  z.object({
    size: z.string({ required_error: "Size is required" }),
  });

type FormValues = z.infer<ReturnType<typeof schema>>;

export function RgoInputToggleButtonGroupWithFormInputDemo() {
  const t = useTranslationLocal();

  const { control, handleSubmit } = useRgoForm<FormValues>({
    t,
    schema,
    defaultValues: {
      size: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ maxWidth: 400 }}>
        <Controller
          name="size"
          control={control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Size">
              <RgoInputToggleButtonGroup
                options={OPTIONS}
                renderOption={option => option}
                renderKey={option => option}
                value={field.value ?? null}
                onChange={val => field.onChange(val)}
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

export const RgoInputToggleButtonGroupWithFormInputDemoCode = `
import { RgoLabelBox, RgoInputToggleButtonGroup } from "@vireocodedev/starter-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { Controller, useRgoForm } from "react-hook-form";
import z from "zod";

const OPTIONS = ["Small", "Medium", "Large"];

const schema = z.object({
  size: z.string({ required_error: "Size is required" }),
});

type FormValues = z.infer<typeof schema>;

export function RgoInputToggleButtonGroupWithFormInputDemo() {
  const { control, handleSubmit } = useRgoForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      size: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ maxWidth: 400 }}>
        <Controller
          name="size"
          control={control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Size">
              <RgoInputToggleButtonGroup
                options={OPTIONS}
                renderOption={option => option}
                renderKey={option => option}
                value={field.value ?? null}
                onChange={val => field.onChange(val)}
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
