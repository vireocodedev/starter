import { Container } from "@mui/material";
import React from "react";
import "./RgoPageBody.css";

export type RgoPageBodyProps = {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  drawer?: React.ReactNode;
};

export function RgoPageBody({ children, maxWidth = false, drawer }: RgoPageBodyProps) {
  return (
    <div className="rgo-page-body">
      <div className="rgo-page-body-content">
        <Container
          maxWidth={maxWidth}
          sx={{
            py: 3,
            px: maxWidth === false ? 3 : undefined,
          }}
        >
          {children}
        </Container>
      </div>
      {drawer}
    </div>
  );
}
