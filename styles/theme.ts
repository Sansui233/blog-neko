import { DefaultTheme } from "styled-components"

export const lightTheme: DefaultTheme = {
  mode: 'light',
  assets: {
    favico: '/avatar-white.png',
  },
  colors: {
    textPrimary: 'black',
    textGray: '#666666',
    background: 'white',
    hoverBg: '#00000022',
    codeBlockBg: '#eeeeee',
  }
}
export const darkTheme: DefaultTheme = {
  mode: 'dark',
  assets: {
    favico: '/avatar-black.png',
  },
  colors: {
    textPrimary: 'white',
    textGray: '#aaaaaa',
    background: '#242424',
    hoverBg: '#ffffff55',
    codeBlockBg: '#111111',
  }
}
