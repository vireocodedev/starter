import React from "react";

const DOWNLOAD_PRESETS = {
  csv: {
    mimeType: "text/csv;charset=utf-8;",
    extension: "csv",
  },
  xlsx: {
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  },
} as const satisfies Record<string, DownloadPreset>;

export type DownloadPreset = {
  mimeType: string;
  extension: string;
};

export type DownloadPresetKey = keyof typeof DOWNLOAD_PRESETS;

export type DownloadParams = {
  data: string | Blob | ArrayBuffer;
  fileName: string;
  preset: DownloadPresetKey | DownloadPreset;
};

export function useRgoDownloadFn() {
  return React.useCallback(({ data, fileName, preset }: DownloadParams) => {
    const { mimeType, extension } = typeof preset === "string" ? DOWNLOAD_PRESETS[preset] : preset;

    const blob = data instanceof Blob && data.type === mimeType ? data : new Blob([data], { type: mimeType });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, []);
}
