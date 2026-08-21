import React from "react";

export const UnknownCountryFlag = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  function UnknownCountryFlag(props, ref) {
    return (
      <svg {...props} ref={ref}>
        <rect width="24" height="16" fill="var(--VireoCountryFlag-unknownBackground)" />
        <text
          x="12"
          y="11.5"
          fill="var(--VireoCountryFlag-unknownForeground)"
          fontFamily="system-ui, sans-serif"
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
        >
          ?
        </text>
      </svg>
    );
  },
);
