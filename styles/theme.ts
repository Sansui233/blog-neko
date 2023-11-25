import { css, DefaultTheme } from "styled-components"

export const lightTheme: DefaultTheme = {
  mode: 'light',
  assets: {
    favico: '/avatar-white.png',
  },
  colors: {
    textPrimary: '#262626',
    textSecondary: '#323232',
    textGray: '#666666',
    textGray2: '#939393',
    accent: '#ae8d0b',
    accentHover: '#e0c56e',
    bg: 'white',
    bg2: '#f4f5f7',
    bgFilter:"multiply",
    bgInverse: "#292929",
    bgMask: "#f4f5f7f4",
    hoverBg: '#00000022',
    shadowBg: `rgb(0 0 0 / 5%)`,
    codeBlockBg: '#f3f3f3',
    maskGradient: css`
    background-image: -webkit-linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    background-image: -moz-linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    background-image: -o-linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    background-image: linear-gradient(top,rgba(255,255,255,0) 0%,rgba(255,255,255,.8) 40%,rgba(255,255,255,1) 75%);
    `,
    navBgGradient: css`
    background: -webkit-linear-linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    background: -moz-linear-linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    background: -o-linear-linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 14%, rgba(255,255,255,1) 23%, rgba(255,255,255,1) 100%);
    `,
    uiLineGray: "#a2a2a280",
  }
}
export const darkTheme: DefaultTheme = {
  mode: 'dark',
  assets: {
    favico: '/avatar-black.png',
  },
  colors: {
    textPrimary: 'white',
    textSecondary: '#d9d8d2',
    textGray: '#aaaaaa',
    textGray2: '#8e8e8e',
    accent: '#c4a747',
    accentHover: '#ae8d0b',
    bg: '#242424',
    bg2: '#1e1e1e',
    bgMask: "#242424f4",
    bgFilter: "screen",
    bgInverse: 'white',
    hoverBg: '#ffffff55',
    shadowBg: `rgb(255 255 255 / 5%)`,
    codeBlockBg: '#3b3b3b',
    maskGradient: css`
    background-image: -webkit-linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    background-image: -moz-linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    background-image: -o-linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    background-image: linear-gradient(top,rgba(36,36,36,0) 0%,rgba(36,36,36,.8) 40%,rgba(36,36,36,1) 75%);
    `,
    navBgGradient: css`
    background: -webkit-linear-linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    background: -moz-linear-linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    background: -o-linear-linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    background: linear-gradient(to right, rgba(36,36,36,0) 0%, rgba(36,36,36,0.8) 14%, rgba(36,36,36,1) 23%, rgba(36,36,36,1) 100%);
    `,
    filterDarker: css`filter: brightness(0.8);`,
    uiLineGray: "#a2a2a280",
  }
}

export const genSystemTheme = ((): DefaultTheme => {
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme
  return {
    ...theme,
    mode: 'system'
  }
})
