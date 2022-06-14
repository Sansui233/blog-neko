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
      textGray: string,
      gold: string,
      goldHover: string,
      bg: string,
      bgInverse: string,
      hoverBg: string,
      codeBlockBg: string,
      shadowBg: string,
      memoGradient: FlattenSimpleInterpolation,
      navBgGradient: FlattenInterpolation,
      filterDarker?: FlattenSimpleInterpolation,
    },
  }
}