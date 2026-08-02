import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { WarningAmber } from "@mui/icons-material";
import { Alert, Box, Button, Typography } from "@mui/material";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import "./RgoQueryErrorBoundary.css";

export type RgoQueryErrorBoundaryProps = {
  children: React.ReactNode;
  FallbackComponent?: React.ComponentType<FallbackProps>;
};

function RgoFallbackComponent({ resetErrorBoundary }: FallbackProps) {
  const t = useTranslationLocal();

  return (
    <Box display="flex" alignItems="center" justifyContent="center" p={4}>
      <Alert
        severity="error"
        icon={<WarningAmber />}
        action={
          <Button color="inherit" size="small" onClick={resetErrorBoundary}>
            {t("common.retry")}
          </Button>
        }
      >
        <Typography variant="body2">{t("common.oopsSomethingWentWrongPleaseTryAgain")}</Typography>
      </Alert>
    </Box>
  );
}

export function RgoQueryErrorBoundary({ children, FallbackComponent }: RgoQueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={FallbackComponent || RgoFallbackComponent}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
