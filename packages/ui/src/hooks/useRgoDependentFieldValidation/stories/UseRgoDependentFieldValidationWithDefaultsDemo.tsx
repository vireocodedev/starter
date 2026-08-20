import { RgoLabelBox } from "@/core/public";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputDate } from "@/components/inputs/RgoInputDate/RgoInputDate";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { useRgoDependentFieldValidation } from "@/hooks/useRgoDependentFieldValidation/useRgoDependentFieldValidation";
import { useRgoForm, type UseFormSchema } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, CardActions, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import z from "zod";

const DateRangeDto = z.object({
  startDate: z.number().nullable(),
  endDate: z.number().nullable(),
});

type DateRangeDto = z.infer<typeof DateRangeDto>;

const DATE_RANGE_SCHEMA: UseFormSchema<DateRangeDto> = () => {
  return DateRangeDto.extend({}).refine(data => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
};

export function UseDependentFieldValidationWithDefaultsDemo() {
  const t = useTranslationLocal();
  const form = useRgoForm<DateRangeDto>({
    t,
    schema: DATE_RANGE_SCHEMA,
    defaultValues: {
      startDate: dayjs().valueOf(),
      endDate: dayjs().add(7, "days").valueOf(),
    },
  });

  const onSubmit = async (data: DateRangeDto) => {
    alert(JSON.stringify(data, null, 2));
  };

  // Use the hook to validate dependent fields
  useRgoDependentFieldValidation(form, "startDate", "endDate");

  return (
    <RgoForm form={form} onSubmit={onSubmit}>
      <RgoFormSection label="Date range">
        <Typography variant="body2" color="text.secondary">
          Click Submit, set the start date to a value after the end date, and observe how the end date is validated once
          the start date changes.
        </Typography>

        <Stack spacing={2} direction="row">
          <RgoLabelBox label="Start Date">
            <Controller
              name="startDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <RgoInputDate
                  value={field.value}
                  onChange={date => field.onChange(date?.valueOf() || null)}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </RgoLabelBox>

          <RgoLabelBox label="End Date">
            <Controller
              name="endDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <RgoInputDate
                  value={field.value}
                  onChange={date => field.onChange(date?.valueOf() || null)}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </RgoLabelBox>
        </Stack>
      </RgoFormSection>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </CardActions>
    </RgoForm>
  );
}

export const UseDependentFieldValidationWithDefaultsDemoCode = `
import { 
  RgoLabelBox, 
  RgoInputDate, 
  RgoForm, 
  useRgoDependentFieldValidation, 
  useRgoForm, 
  type UseFormSchema 
} from "@vireocodedev/starter-ui";
import { Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import z from "zod";

const DateRangeDto = z.object({
  startDate: z.number().nullable(),
  endDate: z.number().nullable(),
});

type DateRangeDto = z.infer<typeof DateRangeDto>;

const DATE_RANGE_SCHEMA: UseFormSchema<DateRangeDto> = () => {
  return DateRangeDto.extend({}).refine(data => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });
};

export function UseDependentFieldValidationWithDefaultsDemo() {
  const form = useRgoForm<DateRangeDto>({
    schema: DATE_RANGE_SCHEMA,
    defaultValues: {
      startDate: dayjs().valueOf(),
      endDate: dayjs().add(7, "days").valueOf(),
    },
  });

  const onSubmit = async (data: DateRangeDto) => {
    alert(JSON.stringify(data, null, 2));
  };

  // Use the hook to validate dependent fields
  useRgoDependentFieldValidation(form, "startDate", "endDate");

  return (
    <RgoForm form={form} onSubmit={onSubmit} disableContentPadding>
      <Typography variant="body2" color="text.secondary">
        Click Submit, set the start date to a value after the end date, and observe how the end date is validated once
        the start date changes.
      </Typography>

      <Stack spacing={2} direction="row">
        <RgoLabelBox label="Start Date">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <RgoInputDate
                value={field.value}
                onChange={date => field.onChange(date?.valueOf() || null)}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>

        <RgoLabelBox label="End Date">
          <Controller
            name="endDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <RgoInputDate
                value={field.value}
                onChange={date => field.onChange(date?.valueOf() || null)}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>
      </Stack>
    </RgoForm>
  );
}`;
