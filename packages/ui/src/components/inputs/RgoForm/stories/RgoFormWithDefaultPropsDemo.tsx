import { RgoLabelBox } from "@/core/public";
import { RgoForm, type RgoFormProps } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputText } from "@/components/inputs/RgoInputText/RgoInputText";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Button, Grid2 as Grid } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

// Simple contact form schema
const contactFormSchema = () =>
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
  });

type FormData = z.infer<ReturnType<typeof contactFormSchema>>;

type RgoFormWithDefaultPropsDemoProps = Partial<Omit<RgoFormProps<FormData>, "form" | "onSubmit" | "children">>;

export function RgoFormWithDefaultPropsDemo(props: RgoFormWithDefaultPropsDemoProps = {}) {
  const t = useTranslationLocal();
  const form = useRgoForm<FormData>({
    t,
    schema: contactFormSchema,
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <RgoForm {...props} form={form} onSubmit={handleSubmit}>
      <RgoFormSection label="Contact Information">
        <RgoFormSectionGrid>
          <Grid size={12}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <RgoLabelBox label="Name" required>
                  <RgoInputText {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                </RgoLabelBox>
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <RgoLabelBox label="Email" required>
                  <RgoInputText
                    {...field}
                    rgoSlotProps={{
                      root: { type: "email" },
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </RgoLabelBox>
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <RgoLabelBox label="Message" required>
                  <RgoInputText
                    {...field}
                    rgoSlotProps={{
                      root: { multiline: true, rows: 4 },
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                </RgoLabelBox>
              )}
            />
          </Grid>
        </RgoFormSectionGrid>
      </RgoFormSection>

      <RgoFormSection>
        <RgoFormSectionGrid>
          <Grid size={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={form.submitDisabled}>
              Submit
            </Button>
          </Grid>
        </RgoFormSectionGrid>
      </RgoFormSection>
    </RgoForm>
  );
}

export const RgoFormWithDefaultPropsDemoCode = `import { RgoLabelBox, RgoForm, RgoInputText, useRgoForm, type RgoFormProps } from "@vireocodedev/starter-ui";
import { Button, Stack } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import z from "zod";

const contactFormSchema = () =>
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
  });

type FormData = z.infer<ReturnType<typeof contactFormSchema>>;

export function RgoFormWithDefaultPropsDemo() {
  const form = useRgoForm<FormData>({
    schema: contactFormSchema,
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <RgoForm form={form} onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Name" required>
              <RgoInputText
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </RgoLabelBox>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Email" required>
              <RgoInputText
                {...field}
                type="email"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </RgoLabelBox>
          )}
        />

        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Message" required>
              <RgoInputText
                {...field}
                multiline
                rows={4}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </RgoLabelBox>
          )}
        />

        <Button type="submit" variant="contained" disabled={form.submitDisabled}>
          Submit
        </Button>
      </Stack>
    </RgoForm>
  );
}`;
