import '../styles/global.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme } from '../styles/theme'
import { GlobalStyle } from '../styles/global'
import { useEffect, useState } from 'react'
import { emitter, getAppTheme, ThemeEvtName, ThemeMsg, ThemeCallBack } from '../utils/app-states'

function MyApp({ Component, pageProps }: AppProps) {

  const [theme, setTheme] = useState(lightTheme); // TODO 需要更加合理的默认值

  // State Init and subscribe
  useEffect(() => {
    setTheme(getAppTheme() === 'dark' ? darkTheme : lightTheme)

    const themeCallback: ThemeCallBack = (themeText: ThemeMsg) => {
      setTheme(themeText === 'dark' ? darkTheme : lightTheme)
    }
    emitter.on(ThemeEvtName, themeCallback);

    return () => {
      emitter.removeListener(ThemeEvtName, themeCallback)
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
