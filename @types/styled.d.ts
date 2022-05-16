// import original module declarations
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode: 'light' | 'dark',
    assets: {
      favico: string,
    }
    colors: {
      textPrimary: string,
      textGray: string,
      background: string,
      hoverBg: string,
      codeBlockBg: string,
    };
  }
}