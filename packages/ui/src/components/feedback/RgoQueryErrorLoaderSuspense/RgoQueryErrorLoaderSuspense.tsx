import { RgoLoaderSuspense } from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoLoaderSuspense/RgoLoaderSuspense";
import { RgoQueryErrorBoundary } from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoQueryErrorBoundary/RgoQueryErrorBoundary";
import { type FallbackProps } from "react-error-boundary";
import "./RgoQueryErrorLoaderSuspense.css";

export type RgoQueryErrorLoaderSuspenseProps = {
  children: React.ReactNode;
  ErrorComponent?: React.ComponentType<FallbackProps>;
  LoaderComponent?: React.ComponentType;
};

export function RgoQueryErrorLoaderSuspense({
  children,
  ErrorComponent,
  LoaderComponent,
}: RgoQueryErrorLoaderSuspenseProps) {
  return (
    <RgoQueryErrorBoundary FallbackComponent={ErrorComponent}>
      <RgoLoaderSuspense FallbackComponent={LoaderComponent}>{children}</RgoLoaderSuspense>
    </RgoQueryErrorBoundary>
  );
}
