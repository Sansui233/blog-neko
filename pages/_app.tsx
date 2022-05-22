import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { emitter, getAppTheme, ThemeCallBack, ThemeMsg, THEME_EVT_NAME } from '../lib/app-states'
import * as gtag from '../lib/gtag'
import { GlobalStyle } from '../styles/global'
import '../styles/global.css'
import { darkTheme, genSystemTheme, lightTheme } from '../styles/theme'

function MyApp({ Component, pageProps }: AppProps) {

  const [theme, setTheme] = useState(lightTheme);
  const themeRef = useRef(theme) // 防止 theme 更新而反复 addListener
  const router = useRouter()

  // Google Analystics
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])


  useEffect(() => { themeRef.current = theme }, [theme])

  // Theme onchange
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
    emitter.on(THEME_EVT_NAME, themeCallback);

    const systemThemeCallBack = () => {
      if (themeRef.current.mode === 'system') {
        setTheme(genSystemTheme())
      }
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', systemThemeCallBack)

    return () => {
      emitter.removeListener(THEME_EVT_NAME, themeCallback)
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', systemThemeCallBack)
    }
  }, [themeRef])

  return <>
    {/* Global Site Tag (gtag.js) - Google Analytics */}
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
    />
    <Script
      id="gtag-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
      }}
    />
    <ThemeProvider theme={theme}>
      {/* <div id='tooltip-portal'>全局</div> */}
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  </>
}

export default MyApp
