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
      gold: string,
      goldHover: string,
      bg: string,
      bg2: string,
      bgInverse: string,
      hoverBg: string,
      codeBlockBg: string,
      shadowBg: string,
      maskGradient: FlattenSimpleInterpolation,
      navBgGradient: FlattenInterpolation,
      filterDarker?: FlattenSimpleInterpolation,
      uiLineGray: string,
    },
  }
}