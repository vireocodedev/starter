import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VireoFileImagePreview } from "./VireoFileImagePreview";
import { vireoFileImagePreviewClasses } from "./VireoFileImagePreview.classes";
import { VIREO_FILE_IMAGE_PREVIEW_NAME } from "./VireoFileImagePreview.identity";

const imageFile = new File(["image"], "avatar.png", { type: "image/png" });
const documentFile = new File(["document"], "report.pdf", { type: "application/pdf" });

describe(VIREO_FILE_IMAGE_PREVIEW_NAME, () => {
  const createObjectURL = vi.fn(() => "blob:vireo-preview");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
  });

  afterEach(() => {
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it("creates an image object URL and revokes it when the preview leaves the tree", () => {
    const { unmount } = render(<VireoFileImagePreview file={imageFile} alt="Customer avatar" />);

    const image = screen.getByRole("img", { name: "Customer avatar" });
    expect(image).toHaveAttribute("src", "blob:vireo-preview");
    expect(image).toHaveClass(vireoFileImagePreviewClasses.image);
    expect(createObjectURL).toHaveBeenCalledWith(imageFile);

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:vireo-preview");
  });

  it("uses the unavailable fallback for non-image files without creating an object URL", () => {
    render(<VireoFileImagePreview file={documentFile} previewUnavailableText="No document preview" />);

    expect(screen.getByText("No document preview")).toHaveClass(
      vireoFileImagePreviewClasses.fallback,
      vireoFileImagePreviewClasses.unavailable,
    );
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("falls back when the browser cannot decode an image", () => {
    render(<VireoFileImagePreview file={imageFile} alt="Broken preview" />);

    fireEvent.error(screen.getByRole("img", { name: "Broken preview" }));
    expect(screen.getByText("Preview unavailable")).toBeInTheDocument();
  });

  it("forwards refs, replacement slots, owner state, and root customization", () => {
    const forwardedRef = React.createRef<HTMLDivElement>();
    const rootSlotRef = React.createRef<HTMLDivElement>();

    render(
      <VireoFileImagePreview
        file={imageFile}
        ref={forwardedRef}
        className="direct-class"
        slots={{ root: "section" }}
        slotProps={{
          root: { ref: rootSlotRef, "aria-label": "Image preview", className: "slot-class" },
          image: ownerState => ({ "data-fit": ownerState.objectFit }),
        }}
        objectFit="cover"
      />,
    );

    const root = screen.getByRole("region", { name: "Image preview" });
    expect(forwardedRef.current).toBe(root);
    expect(rootSlotRef.current).toBe(root);
    expect(root).toHaveClass(vireoFileImagePreviewClasses.root, "direct-class", "slot-class");
    expect(root.querySelector("img")).toHaveAttribute("data-fit", "cover");
  });

  it("uses theme default props and style overrides", () => {
    const theme = createTheme({
      components: {
        [VIREO_FILE_IMAGE_PREVIEW_NAME]: {
          defaultProps: { className: "theme-default-class", objectFit: "cover" },
          styleOverrides: { root: { color: "rgb(123, 45, 67)" } },
        },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <VireoFileImagePreview file={imageFile} />
      </ThemeProvider>,
    );

    const image = document.querySelector("img");
    const root = image?.parentElement;
    expect(root).toHaveClass("theme-default-class");
    expect(root).toHaveStyle({ color: "rgb(123, 45, 67)" });
    expect(image).toHaveStyle({ objectFit: "cover" });
  });
});
