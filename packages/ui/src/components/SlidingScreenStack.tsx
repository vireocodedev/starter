import { Box, useTheme } from "@mui/material";
import React from "react";

export type SlidingScreenStackScreen<TScreen extends string> = {
  id: TScreen;
  children: React.ReactNode;
};

export type SlidingScreenStackProps<TScreen extends string> = {
  activeScreen: TScreen;
  screens: SlidingScreenStackScreen<TScreen>[];
};

export function SlidingScreenStack<TScreen extends string>({
  activeScreen,
  screens,
}: SlidingScreenStackProps<TScreen>) {
  const theme = useTheme();
  const activeScreenIndex = Math.max(
    screens.findIndex(screen => screen.id === activeScreen),
    0,
  );
  const screenCount = Math.max(screens.length, 1);

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex" }}>
      <Box
        sx={{
          display: "flex",
          flex: `0 0 ${screenCount * 100}%`,
          width: `${screenCount * 100}%`,
          maxWidth: `${screenCount * 100}%`,
          height: "100%",
          minHeight: 0,
          transform: `translateX(-${(activeScreenIndex * 100) / screenCount}%)`,
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
          }),
        }}
      >
        {screens.map(screen => (
          <Box
            key={screen.id}
            sx={{
              flex: `0 0 ${100 / screenCount}%`,
              maxWidth: `${100 / screenCount}%`,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {screen.children}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
