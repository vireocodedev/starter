export type AppBrand = {
  name: string;
  description: string;
  theme: {
    dark: {
      nav: string;
      background: string;
    };
    light: {
      nav: string;
      background: string;
    };
  };
  logo: {
    path: {
      light: string;
      dark: string;
      favicon: string;
    };
    size: {
      icon: number;
      brand: number;
    };
  };
  navigation: {
    drawerMaxHeight: string;
    bottomNavHeightPx: number;
  };
  locale: {
    default: string;
    alternate: string;
  };
};
