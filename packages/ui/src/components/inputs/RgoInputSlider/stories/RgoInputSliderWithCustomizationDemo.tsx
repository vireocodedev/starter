import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputSlider, type RgoInputSliderProps } from "@/components/inputs/RgoInputSlider/RgoInputSlider";
import { VolumeDown, VolumeUp } from "@mui/icons-material";
import { Grid } from "@mui/material";
import React from "react";

type RgoInputSliderWithCustomizationDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithCustomizationDemo(
  props: RgoInputSliderWithCustomizationDemoProps = {
    rgoSlotProps: {
      slider: {
        sx: {
          color: "primary.main",
        },
      },
    },
  },
) {
  const [value, setValue] = React.useState<number | null>(50);

  return (
    <RgoLabelBox label="Input field">
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <VolumeDown color="primary" />
        </Grid>
        <Grid item xs>
          <RgoInputSlider {...props} min={0} max={100} step={1} value={value} onChange={setValue} />
        </Grid>
        <Grid item>
          <VolumeUp color="primary" />
        </Grid>
      </Grid>
    </RgoLabelBox>
  );
}

export const RgoInputSliderWithCustomizationDemoCode = `
import { RgoLabelBox, RgoInputSlider, type RgoInputSliderProps } from "@vireocodedev/starter-ui";
import { VolumeDown, VolumeUp } from "@mui/icons-material";
import { Grid } from "@mui/material";
import React from "react";

type RgoInputSliderWithCustomizationDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithCustomizationDemo(
  props: RgoInputSliderWithCustomizationDemoProps = {
    rgoSlotProps: {
      slider: {
        sx: {
          color: "primary.main",
        },
      },
    },
  },
) {
  const [value, setValue] = React.useState<number | null>(50);

  return (
    <RgoLabelBox label="Input field">
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <VolumeDown color="primary" />
        </Grid>
        <Grid item xs>
          <RgoInputSlider 
            {...props} 
            min={0}
            max={100}
            step={1}
            value={value} 
            onChange={setValue} 
          />
        </Grid>
        <Grid item>
          <VolumeUp color="primary" />
        </Grid>
      </Grid>
    </RgoLabelBox>
  );
}`;
