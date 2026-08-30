import { useTheme } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { VireoStorybookProvider } from "../storybook/VireoStorybookProvider";

function ThemeProbe() {
  const theme = useTheme();
  return <output>{`${theme.palette.mode}:${theme.vireo.surface.canvas}`}</output>;
}

describe("VireoStorybookProvider", () => {
  it.each([
    ["light", "light:#f8fafc"],
    ["dark", "dark:#080d18"],
  ] as const)("renders the canonical %s review theme", (themeMode, expected) => {
    render(
      <VireoStorybookProvider themeMode={themeMode}>
        <ThemeProbe />
      </VireoStorybookProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent(expected);
  });

  it("lets nested executable examples inherit the selected outer review mode", () => {
    render(
      <VireoStorybookProvider themeMode="light">
        <VireoStorybookProvider>
          <ThemeProbe />
        </VireoStorybookProvider>
      </VireoStorybookProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("light:#f8fafc");
  });
});
