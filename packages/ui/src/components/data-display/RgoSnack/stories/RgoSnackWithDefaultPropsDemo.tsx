import { RgoSnack, type RgoSnackProps } from "@/components/data-display/RgoSnack/RgoSnack";

type RgoSnackWithDefaultPropsDemoProps = Partial<RgoSnackProps>;

export function RgoSnackWithDefaultPropsDemo({
  message = "This is a basic snack message",
  ...props
}: RgoSnackWithDefaultPropsDemoProps) {
  return <RgoSnack message={message} {...props} />;
}

export const RgoSnackWithDefaultPropsDemoCode = `
import { RgoSnack, type RgoSnackProps } from "@vireocodedev/starter-ui";

type RgoSnackWithDefaultPropsDemoProps = Partial<RgoSnackProps>;

export function RgoSnackWithDefaultPropsDemo({
  message = "This is a basic snack message",
  ...props
}: RgoSnackWithDefaultPropsDemoProps) {
  return <RgoSnack message={message} {...props} />;
}`;
