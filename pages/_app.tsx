import '../styles/global.css'
import type { AppProps } from 'next/app'
import { DefaultTheme, ThemeProvider } from 'styled-components'
import { darkTheme, genSystemTheme, lightTheme } from '../styles/theme'
import { GlobalStyle } from '../styles/global'
import { useEffect, useState } from 'react'
import { emitter, getAppTheme, ThemeEvtName, ThemeMsg, ThemeCallBack } from '../utils/app-states'

function MyApp({ Component, pageProps }: AppProps) {

  const [theme, setTheme] = useState(lightTheme);

  // Theme Init and subscribe changes
  useEffect(() => {
    setTheme(getAppTheme() === 'dark' ?
      darkTheme : getAppTheme() === 'light' ?
        lightTheme : genSystemTheme())

    // subscribe changes
    const themeCallback: ThemeCallBack = (themeText: ThemeMsg) => {
      setTheme(themeText === 'dark' ?
        darkTheme : themeText === 'light' ?
          lightTheme : genSystemTheme())
    }
    emitter.on(ThemeEvtName, themeCallback);

    const systemThemeCallBack = () => setTheme(genSystemTheme())
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', systemThemeCallBack)

    return () => {
      emitter.removeListener(ThemeEvtName, themeCallback)
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', systemThemeCallBack)
    }
  }, [])

  return <>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  </>
}

export default MyApp
