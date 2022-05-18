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
      bg: string,
      bgInverse: string,
      hoverBg: string,
      codeBlockBg: string,
      memoGradient: FlattenSimpleInterpolation,
      navBgGradient: FlattenInterpolation,
    },
    styles: {
      boxShadowHidden: FlattenSimpleInterplation,
      boxShadow: FlattenSimpleInterplation,
    }
  }
}