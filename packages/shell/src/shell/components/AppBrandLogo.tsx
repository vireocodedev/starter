import { type AppBrand } from "@/config/app.config.brand";
import { Box, useTheme } from "@mui/material";

export type AppBrandLogoProps = {
  brand: AppBrand;
  variant?: "icon" | "brand";
};

export function AppBrandLogo({ brand, variant = "icon" }: AppBrandLogoProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const logoPath = isDarkMode ? brand.logo.path.dark : brand.logo.path.light;
  const width = variant === "icon" ? brand.logo.size.icon : brand.logo.size.brand;

  return (
    <Box
      component="img"
      src={logoPath}
      alt={brand.name}
      sx={{
        width,
        height: "auto",
        display: "block",
        objectFit: "contain",
      }}
    />
  );
}
