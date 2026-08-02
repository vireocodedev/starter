import { RgoLoader } from "@/components/feedback/RgoLoader/RgoLoader";
import React, { Suspense } from "react";
import "./RgoLoaderSuspense.css";

export type RgoLoaderSuspenseProps = {
  children: React.ReactNode;
  FallbackComponent?: React.ComponentType;
  loaderSize?: string | number;
};

export function RgoLoaderSuspense({ children, FallbackComponent, loaderSize }: RgoLoaderSuspenseProps) {
  const fallback = FallbackComponent ? <FallbackComponent /> : <RgoLoader loaderSize={loaderSize} />;
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
