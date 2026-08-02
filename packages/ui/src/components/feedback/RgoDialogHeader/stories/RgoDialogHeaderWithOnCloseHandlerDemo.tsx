import { RgoDialogHeader, type RgoDialogHeaderProps } from "@/components/feedback/RgoDialogHeader/RgoDialogHeader";

export function RgoDialogHeaderWithOnCloseHandlerDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  const onClose = () => {
    alert("Close button clicked!");
  };

  return <RgoDialogHeader {...props} title={title} onClose={onClose} />;
}

export const RgoDialogHeaderWithOnCloseHandlerDemoCode = `
import { RgoDialogHeader, type RgoDialogHeaderProps } from "@vireocodedev/starter-ui";

export function RgoDialogHeaderWithOnCloseHandlerDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  const onClose = () => {
    alert("Close button clicked!");
  };

  return <RgoDialogHeader {...props} title={title} onClose={onClose} />;
}`;
