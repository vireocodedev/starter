import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoForm, type RgoFormProps } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputText } from "@/components/inputs/RgoInputText/RgoInputText";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Alert, Button, CircularProgress, Grid2 as Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import z from "zod";

// Newsletter subscription form schema
const subscriptionSchema = () =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    company: z.string(),
  });

type FormData = z.infer<ReturnType<typeof subscriptionSchema>>;

type RgoFormWithAsyncSubmissionDemoProps = Partial<Omit<RgoFormProps<FormData>, "form" | "onSubmit" | "children">>;

export function RgoFormWithAsyncSubmissionDemo(props: RgoFormWithAsyncSubmissionDemoProps = {}) {
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = React.useState<string>("");

  const t = useTranslationLocal();
  const form = useRgoForm<FormData>({
    t,
    schema: subscriptionSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setSubmitStatus("idle");
      setSubmitMessage("");

      // Simulate API call with potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 70% success rate for demonstration
          if (Math.random() > 0.3) {
            resolve(data);
          } else {
            reject(new Error("Network error: Unable to subscribe. Please try again."));
          }
        }, 2000);
      });

      setSubmitStatus("success");
      setSubmitMessage(`Welcome ${data.firstName}! You've been successfully subscribed to our newsletter.`);

      // Reset form after successful submission
      setTimeout(() => {
        form.reset();
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
  };

  const handleRetry = () => {
    setSubmitStatus("idle");
    setSubmitMessage("");
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h6" component="h2">
        Newsletter Subscription with Async Handling
      </Typography>

      <Typography variant="body2" color="text.secondary">
        This form demonstrates async submission with loading states, error handling, and retry functionality. It has a
        70% success rate to show error handling.
      </Typography>

      <RgoForm {...props} form={form} onSubmit={handleSubmit}>
        <RgoFormSection label="Personal Information">
          <RgoFormSectionGrid>
            <Grid size={6}>
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="First Name" required>
                    <RgoInputText
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={form.formState.isSubmitting}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Last Name" required>
                    <RgoInputText
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={form.formState.isSubmitting}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Email Address" required>
                    <RgoInputText
                      {...field}
                      rgoSlotProps={{
                        root: { type: "email" },
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={form.formState.isSubmitting}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="company"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Company (Optional)">
                    <RgoInputText
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={form.formState.isSubmitting}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>

        <RgoFormSection>
          <RgoFormSectionGrid>
            <Grid size={12} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={form.submitDisabled}
                startIcon={form.formState.isSubmitting ? <CircularProgress size={16} /> : undefined}
                sx={{ minWidth: 140 }}
              >
                {form.formState.isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>

              {submitStatus === "error" && (
                <Button variant="outlined" onClick={handleRetry} disabled={form.formState.isSubmitting}>
                  Try Again
                </Button>
              )}
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>
      </RgoForm>

      {/* Status Messages */}
      {submitMessage && (
        <Alert
          severity={submitStatus === "success" ? "success" : "error"}
          onClose={() => {
            setSubmitStatus("idle");
            setSubmitMessage("");
          }}
        >
          {submitMessage}
        </Alert>
      )}

      {/* Submission Progress */}
      {form.formState.isSubmitting && (
        <Alert severity="info" icon={<CircularProgress size={20} />}>
          Processing your subscription request...
        </Alert>
      )}

      {/* Form State Debug */}
      <Stack spacing={2}>
        <Typography variant="subtitle2">Async Form State:</Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            fontSize: "0.75rem",
            backgroundColor: "grey.100",
            p: 2,
            borderRadius: 1,
          }}
        >
          {JSON.stringify(
            {
              isSubmitting: form.formState.isSubmitting,
              isValid: form.formState.isValid,
              submitDisabled: form.submitDisabled,
              submitStatus,
              formValues: form.getValues(),
            },
            null,
            2,
          )}
        </Typography>
      </Stack>
    </Stack>
  );
}

export const RgoFormWithAsyncSubmissionDemoCode = `import { RgoLabelBox, RgoForm, RgoInputText, useRgoForm } from "@vireocodedev/starter-ui";
import { Alert, Button, CircularProgress, Stack, Typography } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import z from "zod";

const subscriptionSchema = () =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    company: z.string().optional(),
  });

type FormData = z.infer<ReturnType<typeof subscriptionSchema>>;

export function RgoFormWithAsyncSubmissionDemo() {
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = React.useState<string>("");

  const form = useRgoForm<FormData>({
    schema: subscriptionSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setSubmitStatus("idle");
      setSubmitMessage("");

      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            resolve(data);
          } else {
            reject(new Error("Network error: Unable to subscribe. Please try again."));
          }
        }, 2000);
      });

      setSubmitStatus("success");
      setSubmitMessage(\`Welcome \${data.firstName}! You've been successfully subscribed.\`);
      
      // Reset form after successful submission
      setTimeout(() => {
        form.reset();
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 3000);

    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
  };

  return (
    <RgoForm form={form} onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="First Name" required>
              <RgoInputText
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                disabled={form.formState.isSubmitting}
              />
            </RgoLabelBox>
          )}
        />
        
        {/* More form fields... */}

        <Button 
          type="submit" 
          variant="contained" 
          disabled={form.submitDisabled}
          startIcon={form.formState.isSubmitting ? <CircularProgress size={16} /> : undefined}
        >
          {form.formState.isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </Stack>
    </RgoForm>
  );
}`;
