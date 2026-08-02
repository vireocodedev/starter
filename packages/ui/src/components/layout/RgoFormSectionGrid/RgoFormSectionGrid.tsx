import { composeSx } from "@/utils/muiutils";
import { Grid2 as Grid, type Grid2Props as GridProps } from "@mui/material";
import React from "react";
import "./RgoFormSectionGrid.css";

export type RgoFormSectionGridSlotProps = Partial<{
  root: Omit<GridProps, "children">;
}>;

export type RgoFormSectionGridProps = {
  children: React.ReactNode;
  rgoSlotProps?: RgoFormSectionGridSlotProps;
};

export function RgoFormSectionGrid({ children, rgoSlotProps }: RgoFormSectionGridProps) {
  const rootProps = rgoSlotProps?.root || {};

  return (
    <Grid container spacing={2} {...rootProps} sx={composeSx(rootProps.sx, {})}>
      {children}
    </Grid>
  );
}
