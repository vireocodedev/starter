import {
  RgoTruncatedText,
  type RgoTruncatedTextProps,
} from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";

type RgoTruncatedTextWithDefaultPropsDemoProps = Partial<RgoTruncatedTextProps>;

const LONG_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;

export function RgoTruncatedTextWithDefaultPropsDemo({
  text = LONG_TEXT,
  ...props
}: RgoTruncatedTextWithDefaultPropsDemoProps) {
  return <RgoTruncatedText text={text} {...props} />;
}

export const RgoTruncatedTextWithDefaultPropsDemoCode = `
import { RgoTruncatedText, type RgoTruncatedTextProps } from "@vireocodedev/starter-ui";

type RgoTruncatedTextWithDefaultPropsDemoProps = Partial<RgoTruncatedTextProps>;

const LONG_TEXT = \`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.\`;

export function RgoTruncatedTextWithDefaultPropsDemo({
  text = LONG_TEXT,
  ...props
}: RgoTruncatedTextWithDefaultPropsDemoProps) {
  return <RgoTruncatedText text={text} {...props} />;
}`;
