import '../styles/global.css'
import type { AppProps } from 'next/app'
import { DefaultTheme, ThemeProvider } from 'styled-components'
import { darkTheme, genSystemTheme, lightTheme } from '../styles/theme'
import { GlobalStyle } from '../styles/global'
import { useEffect, useRef, useState } from 'react'
import { emitter, getAppTheme, ThemeEvtName, ThemeMsg, ThemeCallBack } from '../utils/app-states'

function MyApp({ Component, pageProps }: AppProps) {

  const [theme, setTheme] = useState(lightTheme);
  const themeRef = useRef(theme) // 防止 theme 更新而反复 addListener

  useEffect(() => { themeRef.current = theme }, [theme])

  // Init
  useEffect(() => {
    console.log('useEffect')
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

    const systemThemeCallBack = () => {
      if (themeRef.current.mode === 'system') {
        setTheme(genSystemTheme())
      }
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', systemThemeCallBack)

    return () => {
      emitter.removeListener(ThemeEvtName, themeCallback)
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', systemThemeCallBack)
    }
  }, [themeRef])

  return <>
    <ThemeProvider theme={theme}>
      {/* <div id='tooltip-portal'>全局</div> */}
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  </>
}

export default MyApp
