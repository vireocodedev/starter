import {
  RgoValueWithUnit,
  type RgoValueWithUnitProps,
} from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";

type RgoValueWithUnitWithDefaultPropsDemoProps = Partial<RgoValueWithUnitProps>;

export function RgoValueWithUnitWithDefaultPropsDemo({
  value = 42,
  unit = "kg",
  toFixed = 0,
}: RgoValueWithUnitWithDefaultPropsDemoProps) {
  return <RgoValueWithUnit value={value} unit={unit} toFixed={toFixed} />;
}

export const RgoValueWithUnitWithDefaultPropsDemoCode = `
import { RgoValueWithUnit, type RgoValueWithUnitProps } from "@vireocodedev/starter-ui";

type RgoValueWithUnitWithDefaultPropsDemoProps = Partial<RgoValueWithUnitProps>;

export function RgoValueWithUnitWithDefaultPropsDemo({
  value = 42,
  unit = "kg",
  toFixed = 0,
}: RgoValueWithUnitWithDefaultPropsDemoProps) {
  return <RgoValueWithUnit value={value} unit={unit} toFixed={toFixed} />;
}`;
