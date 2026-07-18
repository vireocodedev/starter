import { useResponsiveProps } from "@/hooks/useResponsiveProps";
import { type RgoProvider } from "@rgo/front-ui";
import { useEffect } from "react";

export const AppMobileAttributeProvider: RgoProvider = ({ children }) => {
  const mobileAttributeValue = useResponsiveProps<string | undefined>({
    mobile: "true",
    desktop: undefined,
  });

  useEffect(() => {
    if (mobileAttributeValue) {
      document.documentElement.setAttribute("data-mobile", mobileAttributeValue);
    } else {
      document.documentElement.removeAttribute("data-mobile");
    }
  }, [mobileAttributeValue]);

  return <>{children}</>;
};
