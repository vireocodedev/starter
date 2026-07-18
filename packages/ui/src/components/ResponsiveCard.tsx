import { useAppPageContentLayout } from "@/hooks/useAppPageContentLayout";
import { type CardProps, Card } from "@mui/material";
import { type ReactNode } from "react";

export type ResponsiveCardProps = Omit<CardProps, "children"> & {
  children: ReactNode;
};

export function ResponsiveCard({ children, ...cardProps }: ResponsiveCardProps) {
  const { isCompact } = useAppPageContentLayout();

  if (isCompact) {
    return <>{children}</>;
  }

  return <Card {...cardProps}>{children}</Card>;
}
