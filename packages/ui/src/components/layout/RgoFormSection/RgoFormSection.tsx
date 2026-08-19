import { VireoFormSection, type VireoFormSectionProps } from "@/capabilities/forms/components/forms/VireoFormSection";
export type RgoFormSectionSlotProps = NonNullable<VireoFormSectionProps["slotProps"]>;
export type RgoFormSectionProps = Omit<VireoFormSectionProps, "slotProps" | "slots"> & {
  rgoSlotProps?: RgoFormSectionSlotProps;
};
/** @deprecated Use VireoFormSection. */
export function RgoFormSection({ rgoSlotProps, ...props }: RgoFormSectionProps) {
  return <VireoFormSection {...props} slotProps={rgoSlotProps} />;
}
