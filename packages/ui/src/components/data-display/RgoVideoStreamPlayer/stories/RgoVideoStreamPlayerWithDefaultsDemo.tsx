import {
  RgoVideoStreamPlayer,
  type RgoVideoStreamPlayerProps,
} from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";

export function RgoVideoStreamPlayerWithDefaultsDemo(props: RgoVideoStreamPlayerProps) {
  return <RgoVideoStreamPlayer {...props} />;
}

export const RgoVideoStreamPlayerWithDefaultsDemoCode = `
import { RgoVideoStreamPlayer, type RgoVideoStreamPlayerProps } from "@vireocodedev/starter-ui";

export function RgoVideoStreamPlayerWithDefaultsDemo(props: RgoVideoStreamPlayerProps) {
  return <RgoVideoStreamPlayer {...props} />;
}`;
