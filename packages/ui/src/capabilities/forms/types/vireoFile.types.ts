import type React from "react";

/** Responsive filename-overflow strategies shared by Vireo file fields. */
export type VireoFormFileNameTruncation = "middle" | "end" | "none";

/** Props supplied to an opt-in Vireo file preview renderer. */
export type VireoFilePreviewRendererProps = { file: File };

/** Component used to render an optional preview for a browser File. */
export type VireoFilePreviewRenderer = React.ElementType<VireoFilePreviewRendererProps>;
