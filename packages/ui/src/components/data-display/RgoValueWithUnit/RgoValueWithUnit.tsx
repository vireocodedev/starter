import { Box, type BoxProps } from "@mui/material";
import "./RgoValueWithUnit.css";

export type RgoValueWithUnitSlotProps = Partial<{
  root: BoxProps<"span">;
  value: BoxProps<"span">;
  unit: BoxProps<"span">;
}>;

export type RgoValueWithUnitProps = {
  value: number | null | undefined;
  unit: string;
  toFixed?: number;
  rgoSlotProps?: RgoValueWithUnitSlotProps;
};

export function RgoValueWithUnit({ value, unit, toFixed = 0, rgoSlotProps }: RgoValueWithUnitProps) {
  const rootProps = rgoSlotProps?.root ?? {};
  const valueProps = rgoSlotProps?.value ?? {};
  const unitProps = rgoSlotProps?.unit ?? {};

  const valueExists = value !== null && value !== undefined;

  return (
    <Box component="span" {...rootProps} className={`rgo-value-with-unit ${rootProps.className ?? ""}`}>
      <Box component="span" {...valueProps} className={`value ${valueProps.className ?? ""}`}>
        {valueExists ? Number(value).toFixed(toFixed) : "-"}
      </Box>
      {valueExists && (
        <>
          {" "}
          <Box component="span" {...unitProps} className={`unit ${unitProps.className ?? ""}`}>
            {unit}
          </Box>
        </>
      )}
    </Box>
  );
}
