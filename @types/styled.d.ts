// import original module declarations
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode: 'light' | 'dark' | 'system',
    assets: {
      favico: string,
    },
    colors: {
      textPrimary: string,
      textSecondary: string,
      textGray: string,
      textGray2: string,
      textGray3: string,
      accent: string,
      accentHover: string,
      bg: string,
      bg2: string,
      bgInverse: string,
      bgMask: string;
      bgFilter: "multiply" | "screen";
      tagBg: string
      floatBg: string,
      hoverBg: string,
      codeBlockBg: string,
      shadowBg: string,
      maskGradient: FlattenSimpleInterpolation,
      navBgGradient: FlattenInterpolation,
      filterDarker?: FlattenSimpleInterpolation,
      uiLineGray: string,
      uiLineGray2: string,
      uiLineGray3: string,
    },
  }
}