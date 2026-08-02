import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { composeSx } from "@/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import React from "react";
import "./RgoTruncatedText.css";

export type RgoTruncatedTextSlotProps = Partial<{
  root: Omit<BoxProps<"p">, "children" | "component" | "ref">;
  iconContainer: Omit<BoxProps<"span">, "children" | "component">;
  viewMoreLink: Omit<BoxProps<"a">, "children" | "component" | "href" | "onClick">;
}>;

export type RgoTruncatedTextProps = {
  text: string;
  maxWidth?: number | string;
  maxRows?: number;
  viewMoreText?: string;
  viewLessText?: string;
  startIcon?: React.ReactNode;
  rgoSlotProps?: RgoTruncatedTextSlotProps;
};

export function RgoTruncatedText({
  text,
  startIcon,
  maxWidth = 300,
  maxRows = 2,
  viewMoreText: _viewMoreText,
  viewLessText: _viewLessText,
  rgoSlotProps,
}: RgoTruncatedTextProps) {
  const t = useTranslationLocal();

  const rootProps = rgoSlotProps?.root || {};
  const iconProps = rgoSlotProps?.iconContainer || {};
  const viewMoreLinkProps = rgoSlotProps?.viewMoreLink || {};

  const viewMoreText = _viewMoreText || t("common.viewMore");
  const viewLessText = _viewLessText || t("common.viewLess");

  const truncatedContainerRef = React.useRef<HTMLParagraphElement>(null);
  const [touched, setTouched] = React.useState(false);
  const [truncated, setTruncated] = React.useState(false);
  const [scrollHeight, setScrollHeight] = React.useState<number | null>(null);

  const height = !touched || truncated ? `calc((${maxRows} - 1) * 1lh)` : `${scrollHeight}px`;
  const display = touched ? (truncated ? "-webkit-box" : "block") : "-webkit-box";
  const classes = `truncatedContainer ${touched ? "touched" : ""} ${truncated ? "truncated" : ""}`;

  React.useEffect(() => {
    function isTextTruncated(node: HTMLElement) {
      const scrollHeight = node.scrollHeight;
      const clientHeight = node.clientHeight;
      const truncated = scrollHeight > clientHeight;
      if (touched) return;
      setScrollHeight(scrollHeight);
      setTruncated(truncated);
    }

    const truncatedContainer = truncatedContainerRef.current;
    if (!truncatedContainer) return;

    isTextTruncated(truncatedContainer);

    const resizeObserver = new ResizeObserver(m => isTextTruncated(m[0].target as HTMLElement));
    resizeObserver.observe(truncatedContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [text, maxWidth, maxRows, touched]);

  const onViewMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const truncatedContainer = truncatedContainerRef.current;
    if (!truncatedContainer) return;

    setTouched(true);
    setTruncated(!truncated);
    setScrollHeight(truncatedContainer.scrollHeight);
  };

  return (
    <Box
      {...rootProps}
      component="p"
      ref={truncatedContainerRef}
      className={`${classes} ${rootProps.className || ""}`}
      sx={composeSx(rootProps.sx, {
        fontWeight: "normal",
        display,
        maxWidth,
        margin: 0,
        WebkitLineClamp: maxRows,
        "&::before": {
          height,
        },
      })}
    >
      {startIcon && (
        <Box
          {...iconProps}
          component="span"
          sx={composeSx(iconProps.sx, {
            marginRight: 1,
            display: "inline-flex",
            alignItems: "center",
            float: "left",
            marginTop: "2px",
          })}
        >
          {startIcon}
        </Box>
      )}
      <Box
        {...viewMoreLinkProps}
        component="a"
        href="#"
        onClick={onViewMore}
        className={`${viewMoreLinkProps.className || ""} show-more`}
      >
        {truncated ? viewMoreText : viewLessText}
      </Box>
      {text}
    </Box>
  );
}
