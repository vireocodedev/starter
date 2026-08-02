import { RgoDialogHeader, type RgoDialogHeaderProps } from "@/components/feedback/RgoDialogHeader/RgoDialogHeader";

export function RgoDialogHeaderWithDefaultPropsDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  return <RgoDialogHeader {...props} title={title} />;
}

export const RgoDialogHeaderWithDefaultPropsDemoCode = `
import { RgoDialogHeader, type RgoDialogHeaderProps } from "@vireocodedev/starter-ui";

export function RgoDialogHeaderWithDefaultPropsDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  return <RgoDialogHeader {...props} title={title} />;
}`;
