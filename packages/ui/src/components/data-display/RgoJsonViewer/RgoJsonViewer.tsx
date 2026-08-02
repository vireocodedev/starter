import { Box, IconButton, Tooltip } from "@mui/material";
import React from "react";
import "./RgoJsonViewer.css";

export type RgoJsonViewerProps = {
  data: unknown;
  maxHeight?: string;
  copyTooltip?: string;
  copiedTooltip?: string;
};

/**
 * Pretty-prints arbitrary data as JSON in a scrollable monospace block with
 * a copy-to-clipboard button. Display-only; no dialog/modal logic.
 *
 * Designed for surfacing error payloads to end users so they can copy the
 * details into a bug report.
 */
export function RgoJsonViewer({
  data,
  maxHeight = "24rem",
  copyTooltip = "Copy to clipboard",
  copiedTooltip = "Copied!",
}: RgoJsonViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const text = React.useMemo(() => stringify(data), [data]);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard API may be unavailable
    }
  }, [text]);

  return (
    <Box className="rgo-json-viewer">
      <Box className="rgo-json-viewer__toolbar">
        <Tooltip title={copied ? copiedTooltip : copyTooltip}>
          <IconButton size="small" onClick={handleCopy} aria-label={copyTooltip}>
            {/* Inline SVG to avoid pulling icon deps */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          </IconButton>
        </Tooltip>
      </Box>
      <pre className="rgo-json-viewer__pre" style={{ maxHeight }}>
        {text}
      </pre>
    </Box>
  );
}

function stringify(data: unknown): string {
  try {
    return JSON.stringify(data, replacer(), 2);
  } catch (err) {
    return `<unable to stringify: ${err instanceof Error ? err.message : String(err)}>`;
  }
}

// Handles circular refs and non-JSON values (Error, BigInt, undefined, fn).
function replacer() {
  const seen = new WeakSet<object>();
  return (_key: string, value: unknown): unknown => {
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    if (typeof value === "bigint") return value.toString();
    if (typeof value === "function") return `<function ${value.name || "anonymous"}>`;
    if (typeof value === "undefined") return "<undefined>";
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "<circular>";
      seen.add(value);
    }
    return value;
  };
}
